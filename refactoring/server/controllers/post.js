const {post, tag, user, comment, likes, post_tag} = require('../models/index')

module.exports = {
    posttag: async(req, res) => {
        //태그에 맞는 포스트
        //원래는 정보가 없으면 or문으로 기본값 정해주는 용도. 이거 필요한가?
        req.query.page = req.query.page
        req.userId = req.userId
        req.query.tag = req.query.tag
        req.query.notTag = req.query.notTag || null
        let page = Number(req.query.page)
        let offset = 0; //몇 개의 개시물이 나오게 할 것인가?
        if(page !== 0){
            offset = page * 10
        }

        const areaTag = req.query.tag.filter((el) => {
            //태그가 '시'나 '군'으로 끝날경우를 찾는 것. 근데 지역을 따로 구분하지 않을경우 혼선가능성 있음. 예: '해군'등
            return el[el.length-1] === '시' || el[el.length-1] === '군'
        })
        
        const contentTag = req.query.tag.filter((el) => {
            //요는 뭐지? 마찬가지로 '해군'이었을 경우 컨텐츠가 아니라 에리어로 빠짐
            return el[el.length-1] !== '시' && el[el.length-1] !== '군' && el[el.length-1] !== '요'
        })
        try {
            
        } catch (error) {
            return res.status(500).json({"message" : "Server Error"})
        }
    },

    postUser: async(req, res) => {
        //그 사람이 쓴 포스트
    },

    postPick: async(req, res) => {
        //포스트 클릭시 그 내용 전송
    },

    postCreate: async(req, res) => {
        //포스트 생성
    },

    postDelete: async(req, res) => {
        //포스트 삭제
    }
}