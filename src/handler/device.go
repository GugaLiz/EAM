package handler

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"model"
	"path"
)

func InitDevice(e *gin.Engine, r *gin.RouterGroup) {
	r.GET("/devicefile", listDeviceFile)
	r.GET("/devicefile/download", downDeviceFile)
}

type searchFile struct {
	CurrentPage int64 `form:"currentPage,default=1"`
	PageSize    int64 `form:"pageSize,default=10"`
	Index       int64
	Query       string `form:"query"`
	DeviceGuid  string
}

func (p *searchFile) CheckDefault() {
	p.Index = (p.CurrentPage - 1) * p.PageSize
}

func (p searchFile) Response(total int64) map[string]int64 {
	return map[string]int64{
		"current":  p.CurrentPage,
		"pageSize": p.PageSize,
		"total":    total,
	}
}

func downDeviceFile(c *gin.Context) {
	id := c.Query("id")
	var item model.DeviceFile
	sql := `SELECT * FROM "device_file" where id = ? `
	if _, err := db.QueryOne(&item, sql, id); err != nil {
		c.JSON(404, gin.H{
			"msg": err.Error(),
		})
		return
	}
	p := path.Base(item.FilePath)
	c.Header("Content-Type",
		`application/octet-stream;`)
	c.Header("Content-Disposition",
		fmt.Sprintf(`attachment; filename="%s"`, p))
	c.File(item.FilePath)
}

func listDeviceFile(c *gin.Context) {
	var pb searchFile
	if err := c.BindQuery(&pb); err != nil {
		log.Fatal(err)
	}
	pb.CheckDefault()
	var list []model.DeviceFile
	sql1 := `
    SELECT COUNT(id) FROM "device_file" 
    `
	where := ""
	if pb.DeviceGuid != "" {
		where = " where device_guid like ? "
		sql1 = sql1 + where
	}
	sql := `SELECT * FROM "device_file" `
	sql = sql + where
	sql = sql + `
    ORDER BY create_time desc
    LIMIT ? offset ?
    `
	guid := fmt.Sprintf("%%%s%%", pb.DeviceGuid)
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
	for i, _ := range list {
		list[i].FilePath = path.Base(list[i].FilePath)
	}
	c.JSON(200, gin.H{
		"list":       list,
		"pagination": pb.Response(total),
	})
}
