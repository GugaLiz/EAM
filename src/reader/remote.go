package reader

import (
	"bytes"
	"compress/gzip"
	"errors"
	"fmt"
	"log"
	"net"
	"proto"
	"strconv"
	"time"
	"utils"
)

func SendHeartBeat(host string, port int,
	devId string) error {
	remote := fmt.Sprintf("%s:%d", host, port)
	conn, err := net.Dial("tcp", remote)
	if err != nil {
		return err
	}
	defer conn.Close()
	dp := proto.NewRequest("HeartBeat")
	time := time.Now().UTC().Unix()
	req := dp.FormatRequest(map[string]string{
		"Guid": devId,
		"Time": fmt.Sprintf("%d", time),
	})

	log.Printf("%s\n", req)
	if _, err = utils.ConnWrite(conn, req); err != nil {
		return err
	}

	remoteAddr := conn.RemoteAddr().String()
	_ = remoteAddr
	data, err := utils.ConnRead(conn)
	if err != nil {
		return err
	}
	dp = proto.New(data)
	if dp.Values["result"] != "AC" {
		return errors.New(fmt.Sprintf(
			"remote response: %s", dp.Values["message"]))
	} else {
		return nil
	}
}

func SendToRemote(host string, port int,
	devId string, haveUpdate bool,
	fileName string, json []byte) error {
	remote := fmt.Sprintf("%s:%d", host, port)
	conn, err := net.Dial("tcp", remote)
	if err != nil {
		return err
	}
	defer conn.Close()
	total := len(json)
	stotal := strconv.FormatUint(uint64(total), 10)
	dp := proto.NewRequest("FileUpload")
	req := dp.FormatRequest(map[string]string{
		"FileName": fileName,
		"Guid":     devId,
		"Size":     stotal,
	})
	if !haveUpdate {
		req = dp.FormatRequest(map[string]string{
			"NoUpdate": "1",
			"Guid":     devId,
		})
	}

	log.Printf("%s\n", req)
	if _, err = utils.ConnWrite(conn, req); err != nil {
		return err
	}

	remoteAddr := conn.RemoteAddr().String()
	_ = remoteAddr
	data, err := utils.ConnRead(conn)
	if err != nil {
		return err
	}
	dp = proto.New(data)
	//command := strings.ToLower(dp.Command)
	if dp.Values["result"] != "AC" {
		return errors.New(fmt.Sprintf(
			"remote response: %s", dp.Values["message"]))
	} else {
		if !haveUpdate {
			return nil
		}
	}
	if ok, resp := dp.CheckFileSession("5"); !ok {
		return errors.New(resp)
	}
	sid := dp.SessionId
	//sendfile
	bufSize := 20480
	idx := 0
	for idx < total {
		isz := idx + bufSize
		if isz > total {
			isz = total
		}
		jsonData := json[idx:isz]
		//filedata
		dp = proto.NewRequest("FileData")
		dp.SessionId = sid
		sidx := strconv.FormatUint(uint64(idx), 10)
		req := dp.FormatRequest(map[string]string{
			"Zip":      "1",
			"Position": sidx,
		})
		var buf bytes.Buffer
		zw := gzip.NewWriter(&buf)
		if _, err = zw.Write(jsonData); err != nil {
			return err
		}
		zw.Close()
		zbuf := buf.Bytes()
		log.Printf("%s\n", req)
		log.Printf("data size:%d\n", len(zbuf))
		if _, err = utils.ConnWriteData(conn, req, zbuf); err != nil {
			return err
		}
		if resp, err := utils.ConnRead(conn); err != nil {
			return err
		} else {
			dp = proto.New(resp)
			if dp.Values["result"] != "AC" {
				return errors.New(fmt.Sprintf(
					"remote response: %s", dp.Values["message"]))
			}
		}
		idx = isz
	}
	//send eof
	dp = proto.NewRequest("FileEOF")
	dp.SessionId = sid
	req = dp.FormatRequest(map[string]string{
		"FileName": fileName,
		"Guid":     devId,
		"FileSize": stotal,
	})
	log.Printf("%s\n", req)
	if _, err = utils.ConnWrite(conn, req); err != nil {
		return err
	}
	if buf, err := utils.ConnRead(conn); err != nil {
		return err
	} else {
		dp = proto.New(buf)
		if "AC" != dp.Values["result"] {
			return errors.New(fmt.Sprintf(
				"remote response: %s", dp.Values["message"]))
		} else {
			return nil
		}
	}
}
