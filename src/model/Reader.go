package model

import (
	"time"
)

type Reader struct {
	tableName  struct{}  `sql:"reader"`
	Id         int64     //Id
	ReaderId   string    `sql:",type:varchar(50),unique,notnull"` // reader id
	CreateTime time.Time `sql:",notnull"`
	LastUpdate time.Time `sql:",null"`
}
