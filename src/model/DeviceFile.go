package model

import (
	"time"
)

type DeviceFile struct {
	tableName  struct{}  `sql:"device_file"`
	Id         int64     //Id
	DeviceGuid string    `sql:",type:varchar(50),notnull"`   // dev Guid
	FilePath   string    `sql:",type:varchar(200),,notnull"` // file path
	Size       int64     `sql:",notnull"`                    // file size
	CreateTime time.Time `sql:",notnull"`                    // upload time
	IpAddr     string    `sql:",type:varchar(30),notnull"`   // client address
}
