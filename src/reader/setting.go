package reader

import (
	"time"
)

type Setting struct {
	Host               string
	Port               int
	LastUpload         *time.Time
	UploadPreMinute    int
	HeartBeatPreMinute int
}

func GetDefaultSetting() *Setting {
	return &Setting{
		Host:               "localhost",
		Port:               9980,
		UploadPreMinute:    12 * 60,
		HeartBeatPreMinute: 3,
	}
}
