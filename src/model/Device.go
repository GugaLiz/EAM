package model

import (
	"time"
)

type Device struct {
	tableName     struct{}  `sql:"device"`
	Id            int64     //Id
	DeviceGuid    string    `sql:",type:varchar(50),unique,notnull"` // dev Guid
	LastHeartBeat time.Time `sql:",null"`
	LastUpload    time.Time `sql:",null"`
}
