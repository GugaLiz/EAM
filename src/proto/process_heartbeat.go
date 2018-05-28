package proto

import (
	"fmt"
	"github.com/go-pg/pg"
	"log"
	"model"
	"net"
	"strconv"
	"time"
)

func HeartBeat(remote net.Addr,
	dp *DataProto, db *pg.DB) (bool, string) {
	msg := ""
	guid := dp.Values["guid"]
	times := dp.Values["time"]
	var hbTime time.Time
	if guid == "" && times == "" {
		msg = "guid and time is empty"
	} else if guid == "" {
		msg = "guid is empty"
	} else if times == "" {
		msg = "time is empty"
	} else {
		if i, err := strconv.ParseInt(times, 10, 64); err != nil {
			msg = "time is invalid"
		} else {
			hbTime = time.Unix(i, 0)

			now := time.Now().UTC() // record to db
			hb := &model.DeviceHeartBeat{
				DeviceGuid:    guid,
				HeartBeatTime: hbTime,
				CreateTime:    now,
				IpAddr:        remote.String(),
			}
			sql := `
insert into device(device_guid, last_heart_beat) 
    values( ?, ?)
ON conflict(device_guid) 
DO UPDATE SET device_guid = ?, 
    last_heart_beat = ? 
            `
			if _, err := db.Exec(sql, guid, now, guid, now); err != nil {
				msg = fmt.Sprintf("save to db got error:%s", err)
				log.Println(err)
			}
			if err := db.Insert(hb); err != nil {
				msg = fmt.Sprintf("save to db got error:%s", err)
				log.Println(err)
			} else {
				log.Printf("device[%s] heartbeat @ %s.", guid, time.Now())
			}
		}
	}
	if msg != "" {
		return false, dp.GetErrResponse(msg, nil)
	}
	resp := dp.FormatResponse(map[string]string{
		"Result": "AC",
	})
	return true, resp
}
