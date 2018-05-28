package model

import (
	"time"
)

//ClassName       string   `sql:",type:varchar(50)"`          //class

type Asset struct {
	tableName       struct{} `sql:"asset"`
	Id              int64    //Id
	Name            string   `sql:",notnull,type:varchar(200)"` //name
	ClassId         int16    `sql:",notnull"`                   //classCode
	DeptId          int64    `sql:",notnull"`                   //department
	BodyNumber      string   `sql:",type:varchar(50)"`          //
	Brand           string   `sql:",type:varchar(50)"`
	Model           string   `sql:",type:varchar(50)"` //
	Configure       string   `sql:",type:varchar(50)"` //
	PurchaseDate    time.Time
	PurchaseValue   float64
	Warranty        int32
	Supplier        string `sql:",type:varchar(50)"`
	Source          string `sql:",type:varchar(50)"`
	SiteId          int64
	InNetTime       time.Time
	TagId           int64
	EPCCode         string `sql:",type:varchar(50)"`
	TagUpdateTime   time.Time
	StorageLocation string    `sql:",type:varchar(100)"`
	StateId         int16     `sql:",notnull"` //notuse=0, inuse=1, repair=2
	Maintainer      string    `sql:",type:varchar(20)"`
	User            string    `sql:",type:varchar(20)"`
	Memo            string    `sql:",type:varchar(500)"`
	CreateTime      time.Time `sql:",notnull"`
}
