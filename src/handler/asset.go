package handler

import (
	"github.com/gin-gonic/gin"
	"log"
	"model"
)

func InitAsset(e *gin.Engine, r *gin.RouterGroup) {
	r.GET("/asset", listAsset)
}

func listAsset(c *gin.Context) {
	var pb pageBind
	if err := c.BindQuery(&pb); err != nil {
		log.Fatal(err)
	}
	pb.CheckDefault()
	log.Printf("%v\n", pb)
	var list []model.Asset
	sql1 := `
    SELECT COUNT(id) FROM "asset" 
    `
	sql := `
    SELECT * FROM "asset" 
    ORDER BY create_time desc
    LIMIT ? offset ?
    `
	var total int64
	if _, err := db.QueryOne(&total, sql1); err != nil {
		log.Fatal(err)
	}
	if _, err := db.Query(&list, sql, pb.PageSize, pb.Index); err != nil {
		log.Fatal(err)
	}
	c.JSON(200, gin.H{
		"list":       list,
		"pagination": pb.Response(total),
	})
}
