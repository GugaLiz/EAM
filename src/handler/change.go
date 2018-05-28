package handler

import (
	//"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"model"
)

func InitChange(e *gin.Engine, r *gin.RouterGroup) {
	r.GET("/change", listChange)
}

type searchChange struct {
	pageBind
	Name string
}

func listChange(c *gin.Context) {
	var pb searchChange
	if err := c.BindQuery(&(pb.pageBind)); err != nil {
		log.Println(err)
	}
	log.Printf("%v\n", pb)
	pb.CheckDefault()
	log.Printf("%v\n", pb)
	var list []model.AssetChange
	sql1 := `
    SELECT COUNT(id) FROM "asset_change" 
    `
	where := ""
	/*
		if pb.DeviceGuid != "" {
			where = " where _guid like ? "
			sql1 = sql1 + where
		}*/
	sql := `SELECT * FROM "asset_change" `
	sql = sql + where
	sql = sql + `
    ORDER BY create_time desc
    LIMIT ? offset ?
    `
	//guid := fmt.Sprintf("%%%s%%", pb.DeviceGuid)
	guid := ""
	var total int64
	if where == "" {
		if _, err := db.QueryOne(&total, sql1); err != nil {
			log.Fatal(err)
		}
		if _, err := db.Query(&list, sql, pb.PageSize, pb.Index); err != nil {
			log.Fatal(err)
		}
	} else {
		if _, err := db.QueryOne(&total, sql1, guid); err != nil {
			log.Fatal(err)
		}
		if _, err := db.Query(&list, sql, guid,
			pb.PageSize, pb.Index); err != nil {
			log.Fatal(err)
		}
	}
	c.JSON(200, gin.H{
		"list":       list,
		"pagination": pb.Response(total),
	})
}
