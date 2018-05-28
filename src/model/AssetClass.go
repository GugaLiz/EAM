package model

import (
	"time"
)

type AssetClass struct {
	tableName  struct{}  `sql:"asset_class"`
	Id         int64     //Id
	Name       string    `sql:",type:varchar(50),notnull"`
	CreateTime time.Time `sql:",notnull"`
	Memo       string    `sql:"type:varchar(500)"`
}
