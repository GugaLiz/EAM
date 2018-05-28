package handler

import ()

type pageBind struct {
	CurrentPage int64 `form:"currentPage,default=1"`
	PageSize    int64 `form:"pageSize,default=10"`
	Index       int64
	Query       string `form:"query"`
}

func (p *pageBind) CheckDefault() {
	p.Index = (p.CurrentPage - 1) * p.PageSize
}

func (p pageBind) Response(total int64) map[string]int64 {
	return map[string]int64{
		"current":  p.CurrentPage,
		"pageSize": p.PageSize,
		"total":    total,
	}
}
