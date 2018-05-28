package proto

import (
	"bytes"
	"compress/gzip"
	"fmt"
	"github.com/go-pg/pg"
	"io/ioutil"
	"log"
	"model"
	"net"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"
	"utils"
)

// data upload handle

const InvalidFileChars = "\\/:*?\"<>|"
const SavePath = "data/"

func UploadRequest(dp *DataProto) (bool, string) {
	msg := ""
	guid := dp.Values["guid"]
	filename := dp.Values["filename"]
	if guid == "" && filename == "" {
		msg = "guid and filename is empty"
	} else if guid == "" {
		msg = "guid is empty"
	} else if filename == "" {
		msg = "filename is empty"
	} else {
		if strings.ContainsAny(guid, InvalidFileChars) {
			msg = "guid contains invalid char"
		} else if strings.ContainsAny(filename, InvalidFileChars) {
			msg = "fileName contains invalid char"
		} else if strings.HasSuffix(filename, "._tmp") {
			msg = "fileName can not ends with ._tmp"
		}
	}
	if msg != "" {
		return false, dp.GetErrResponse(msg, nil)
	}
	fpath := path.Join(SavePath, guid, filename)
	ftmp := fpath + "._tmp"
	ok, _, fi := utils.PathExists(fpath) // Check File exists, if done?
	if ok {
		resp := dp.FormatResponse(map[string]string{
			"Result":   "NAC",
			"FileName": filename,
			"Size":     "-1",
			"Message":  "file already upload.",
		})
		return true, resp // file upload done
	} else {
		ok, _, fi = utils.PathExists(ftmp)
		var sz int64 = 0
		sid := GetFileSessionId(ftmp)
		msg := ""
		if ok {
			sz = fi.Size() // fie uploading
			msg = fmt.Sprintf(
				"Start upload exists file: %s, Position: %d", filename, sz)
		} else {
			// not exists can upload
			msg = fmt.Sprintf(
				"Start upload new file: %s, Position: %d", filename, sz)
		}
		dp.SessionId = sid
		resp := dp.FormatResponse(map[string]string{
			"FileName": filename,
			"Result":   "AC",
			"Size":     strconv.FormatInt(sz, 10),
			"Message":  msg,
		})
		return true, resp
	}
}

func DataRequest(dp *DataProto) (bool, string) {
	zip := dp.Values["zip"] == "1"
	position := dp.Values["position"]
	var (
		msg         = ""
		pos   int64 = 0
		code        = "1"
		fpath       = ""
		ok          = false
		data        = dp.Data
	)
	if position == "" {
		msg = "Position is empty"
		code = "1"
	} else {
		var err error
		pos, err = strconv.ParseInt(position, 10, 64)
		if err != nil {
			msg = "Position is invalid"
			code = "1"
		}
	}
	if data == nil || len(data) == 0 {
		msg = "data is empty"
		code = "6"
	}
	var saveData []byte
	if msg == "" && zip {
		buf := bytes.NewBuffer(data)
		if zr, err := gzip.NewReader(buf); err != nil {
			msg = "zip decode data error"
			code = "2"
		} else {
			if data1, err := ioutil.ReadAll(zr); err != nil {
				msg = "zip read decode data error"
				code = "2"
			} else {
				log.Printf("====>%d, %d\n", len(data), len(data1))
				saveData = data1
			}
			zr.Close()
		}
	} else {
		saveData = data
	}
	if msg == "" {
		ok, fpath = GetFileNameFromSessionId(dp.SessionId)
		if !ok {
			msg = "File not exists in session"
			code = "5"
		} else if pos > 0 { // is exists file
			ok, _, fi := utils.PathExists(fpath) // Check File exists, if done?
			if !ok {
				msg = "File not found!"
				code = "4" // same write file error
			} else {
				sz1 := fi.Size()
				if sz1 != pos {
					msg = fmt.Sprintf("PositionError!Request Position:%s;Server Position:%s;",
						pos, sz1)
					code = "1"
				}
			}
		} else {
			p := filepath.Dir(fpath)
			log.Println(p)
			if err := os.MkdirAll(p, os.ModePerm); err != nil {
				msg = "server create file path got error." + p
				code = "4"
			}
		}
	}
	if msg == "" {
		f, err := os.OpenFile(fpath,
			os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			msg = "server open file got error."
			code = "4"
		}
		defer f.Close()
		if _, err = f.Write(saveData); err != nil {
			msg = "server write to file got error."
			code = "4"
		}
		//TODO: Update db
	}

	if msg != "" {
		return false, dp.GetErrResponse(msg, map[string]string{
			"Code": code,
		})
	} else {
		return true, dp.GetErrResponse(msg, map[string]string{
			"Result": "AC",
		})
	}
}

func EofRequest(remote net.Addr,
	dp *DataProto, db *pg.DB) (bool, string) {
	msg := ""
	guid := dp.Values["guid"]
	filename := dp.Values["filename"]
	filesize := dp.Values["filesize"]
	var sz int64 = 0
	if filesize == "" {
		msg = "FileSize is empty"
	} else {
		var err error
		sz, err = strconv.ParseInt(filesize, 10, 64)
		if err != nil {
			msg = "FileSize is invalid"
		} else {
			if guid == "" && filename == "" {
				msg = "Guid and FileName is empty"
			} else if guid == "" {
				msg = "Guid is empty"
			} else if guid == "" {
				msg = "FileName is empty"
			} else {
				if strings.ContainsAny(guid, InvalidFileChars) {
					msg = "Guid contains invalid char"
				} else if strings.ContainsAny(filename, InvalidFileChars) {
					msg = "FileName contains invalid char"
				} else if strings.HasSuffix(filename, "._tmp") {
					msg = "FileName can not ends with ._tmp"
				}
			}
		}
	}
	if msg != "" {
		return false, dp.GetErrResponse(msg, nil)
	}
	fname := path.Join(SavePath, guid, filename)
	ftmp := fname + "._tmp"
	ok, fpath := GetFileNameFromSessionId(dp.SessionId)
	if !ok {
		msg = "File not exists in session"
	} else {
		if ftmp != fpath {
			msg = "filename not exists."
			return false, dp.GetErrResponse(msg, nil)
		}
	}
	ok, _, fi := utils.PathExists(fpath) // Check File exists, if done?
	if !ok {
		msg = "File not found!"
		return false, dp.GetErrResponse(msg, map[string]string{
			"FileName": filename,
			"Code":     "3",
		})
	} else {
		sz1 := fi.Size()
		if sz1 != sz {
			msg = fmt.Sprintf("FileEof Size Error!Request FileSize:%d;Server FileSize:%d;",
				sz, sz1)
			return false, dp.GetErrResponse(msg, map[string]string{
				"FileName": filename,
				"Code":     "2",
			})
		} else {
			err := os.Rename(ftmp, fname)
			if err != nil {
				msg = "server rename file got error."
			} else { // save to db
				now := time.Now().UTC() // record to db
				hb := &model.DeviceFile{
					DeviceGuid: guid,
					FilePath:   fname,
					Size:       sz,
					CreateTime: now,
					IpAddr:     remote.String(),
				}
				sql := `
insert into device(device_guid, last_upload) 
    values( ?, ?)
ON conflict(device_guid) 
DO UPDATE SET device_guid = ?, 
    last_upload = ? 
            `
				if _, err := db.Exec(sql, guid, now, guid, now); err != nil {
					msg = fmt.Sprintf("file info save to db got error:%s", err)
					log.Println(err)
				}
				if err := db.Insert(hb); err != nil {
					msg = fmt.Sprintf("file info save to db got error:%s", err)
					log.Println(err)
				} else {
					log.Printf("device[%s] upload file: %s.", guid, fname)
				}
			}
		}
	}
	if msg != "" {
		return false, dp.GetErrResponse(msg, nil)
	}
	resp := dp.FormatResponse(map[string]string{
		"FileName": filename,
		"Result":   "AC",
		"FileSize": strconv.FormatInt(sz, 10),
		"Code":     "0",
		"Message":  "FileEof Done.",
	})
	return true, resp
}
