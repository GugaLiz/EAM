package model

import (
	"time"
)

type AssetChange struct {
	tableName     struct{}  `sql:"asset_change"`
	Id            int64     //Id
	TagId         int64     //
	EPCCode       string    `sql:",type:varchar(50),notnull"`
	AssetId       int64     //
	CreateTime    time.Time `sql:",notnull"`
	LastSiteId    int64     //
	CurrentSiteId int64     //
	CheckUserId   int64     //
	IsPass        bool      //
	Memo          string    `sql:"type:varchar(500)"` //(when not pass)
}
