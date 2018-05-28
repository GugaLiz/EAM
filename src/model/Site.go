package model

import (
	"time"
)

type Site struct {
	tableName    struct{}  `sql:"site"`
	Id           int64     //Id
	Province     string    `sql:",type:varchar(50),notnull"`
	City         string    `sql:",type:varchar(50),notnull"`
	District     string    `sql:",type:varchar(50),null"`
	Name         string    `sql:",type:varchar(50),notnull"`
	Address      string    `sql:",type:varchar(200),notnull"`
	Lng          float64   `sql:",notnull"`
	Lat          float64   `sql:",notnull"`
	CreateUserId int64     `sql:",notnull"`
	CreateTime   time.Time `sql:",notnull"`
}
