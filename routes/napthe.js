//module
var express = require('express');
var router = express.Router();
var bodyparser = require('body-parser')
var sending = require('request')
var hashing = require('../models/hashing')

//bodyparser config
var app = express()
var jsonParser = bodyparser.json()
var urlencodedParser = bodyparser.urlencoded({ extended: true })

//login checker
var myMiddleware = require('../models/auth')

//database
var data = require('../models/sql');
var log_sql = require('../models/log_sql');
const { request } = require('express');

router.get('/', myMiddleware, function (req, res) {
    var id = req.signedCookies.UUID
    data.findOne({ '_id': id }).exec((err, user) => {
        var cuser = user.user
        res.render("napthe", { userdata: cuser, err_msg: "", rmoney: user.rmoney })
    })
})

router.post('/', urlencodedParser, async function (req, res) {



    if (req.body.status) {
        if (req.body.status === 'thanhcong') {
            console.log('thanh cong')
            var content = req.body.content

            console.log()
            console.log('content:', content)
            console.log(typeof (content))

            var cbid = content.slice(0, 24)

            console.log()
            console.log('id:', cbid)

            var keya = content.charAt(content.length - 2)

            console.log()
            console.log('keya:', keya)

            var keyn = content.charAt(content.length - 1)

            console.log()
            console.log('keyn:', keyn)

            var secret = content.slice(24, -2)

            console.log()
            console.log('secret:', secret)

            var unhashed = hashing.unhash_ID('true', keya, keyn)
            console.log(unhashed)
            if (unhashed === secret) {
                data.findOne({ '_id': cbid }).exec((err, user) => {
                    var dbmoney = user.rmoney
                    user.rmoney = dbmoney + parseInt(req.body.amount)

                    user.save(function (err) {
                        if (err) {
                            console.log('x??a m?? th???t b???i')
                        } else {
                            var msg = 'x??a m?? th??nh c??ng'
                            console.log(msg)
                        }

                    })
                })
            }
            // res.send('thanhcong')
        }
        else {
            res.send('fail')
        }
        // else if (req.body.status === 'thatbai') {
        //     var id = req.body.content
        //     id = id.slice(0, 24)
        //     console.log('fail')
        //     data.findOne({ '_id': id }).exec((err, user) => {
        //         var dbmoney = user.rmoney
        //         user.rmoney = dbmoney - 99999999
        //         user.save(function (err) {
        //             if (err) {
        //                 console.log('x??a m?? th???t b???i')
        //             } else {
        //                 var msg = 'x??a m?? th??nh c??ng'
        //                 console.log(msg)
        //             }
        //         })

        //     })
        //     // res.send('thatbai')
        // }
        // else if (req.body.status === 'saimenhgia') {
        //     var id = req.body.content
        //     id = id.slice(0, 24)
        //     console.log('fail')
        //     data.findOne({ '_id': id }).exec((err, user) => {
        //         var dbmoney = user.rmoney
        //         user.rmoney = dbmoney + 99999999
        //         user.save(function (err) {
        //             if (err) {
        //                 console.log('x??a m?? th???t b???i')
        //             } else {
        //                 var msg = 'x??a m?? th??nh c??ng'
        //                 console.log(msg)
        //             }
        //         })

        //     })
        //     // res.send('saimenhgia')
        // }

    }

    //g???i th???

    else {

        //cookie
        var id = req.signedCookies.UUID
        console.log(id)
        data.findOne({ '_id': id }).exec((err, user) => {
            if (user) {
                var cuser = user.user

                //URL            
                var rawurl = 'https://thesieutoc.net/chargingws/v2?APIkey='
                var rawurl2 = '&mathe='
                var rawurl3 = '&seri='
                var rawurl4 = '&type='
                var rawurl5 = '&menhgia='
                var rawurl6 = '&content='

                //req
                var api = '16045612679887621979'
                var ctype = req.body.type
                var amount = req.body.amount
                var MaThe = req.body.pin
                var serial = req.body.serial
                if (MaThe.length === 13 || MaThe.length === 15) {
                    if (serial.length === 11 || serial.length === 14) {

                        //content
                        var hash = hashing.hash_ID('true')
                        var hashed_ID = hash.hashedID
                        console.log('hashed:', hashed_ID)
                        var keya = hash.alphabet_key
                        var keyn = hash.numbly_key
                        var content = id + hashed_ID + keya + keyn
                        console.log(content)

                        var url = rawurl + api + rawurl2 + MaThe + rawurl3 + serial + rawurl4 + ctype + rawurl5 + amount + rawurl6 + content
                        console.log(url)
                        sending.get(url, function (err, res, body) {
                            //n???u c?? l???i
                            if (err) {
                                //console.log(err)
                            }

                            if (res) {
                                console.log("callback:", res.body)
                                if (res.body.status != '00') {
                                    var msg = res.body.msg
                                    let con = log_sql;
                                    var d = new Date()
                                    var month = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                                    var date = d.getDate() + '/' + month[d.getMonth()] + '/' + d.getFullYear()
                                    con.connect(function (err) {
                                        if (err) {
                                            ////console.log(err)
                                        }
                                        console.log("connected !!!")
                                        var sql = "INSERT INTO shopweb_napdatas (Date, Host, Ma_the, Serial, Amount, Status, Note) VALUES (?)"
                                        var values = [
                                            date, ctype, MaThe, serial, amount, 'Th???t B???i', 'Fake / Used'
                                        ]
                                        con.query(sql, [values], function (err, res) {
                                            if (err) {
                                                //console.log(err)
                                            }
                                            console.log("l??u th??? th??nh c??ng")
                                            sending.post('http://shop.monsterrr.net/user/history/napthe',
                                                {
                                                    form: {
                                                        Date: date, 
                                                        Host: ctype,
                                                        Ma_the: MaThe,
                                                        Serial: serial,
                                                        Amount: amount,
                                                        Status: 'Th???t B???i',
                                                        UUID: id
                                                    }
                                                },
                                                function (error, response, body) {
                                                }
                                            )
                                        })
                                    })

                                }
                                else if (res.body.status === '00') {
                                    var msg = res.body.msg
                                    let con = log_sql;
                                    var d = new Date()
                                    var month = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                                    var date = d.getDate() + '/' + month[d.getMonth()] + '/' + d.getFullYear()
                                    con.connect(function (err) {
                                        if (err) {
                                            //console.log(err)
                                        }
                                        console.log("connected !!!")
                                        var sql = "INSERT INTO shopweb_napdatas (Date, Host, Ma_the, Serial, Amount, Status, Note) VALUES (?)"
                                        var values = [
                                            date, ctype, MaThe, serial, amount, '??ang Ch???', '.........'
                                        ]
                                        con.query(sql, [values], function (err, res) {
                                            if (err) {
                                                //console.log(err)
                                            }
                                            console.log("l??u th??? th??nh c??ng")
                                        })
                                    })
                                    sending.post('http://shop.monsterrr.net/user/history/napthe',
                                        {
                                            form: {
                                                Date: date,
                                                Host: ctype,
                                                Ma_the: MaThe,
                                                Serial: serial,
                                                Amount: amount,
                                                Status: '??ang Ch???',
                                                UUID: id
                                            }
                                        },
                                        function (error, response, body) {
                                        }
                                    )
                                }
                            }
                        })
                        res.redirect('/nap-the')
                    }
                    else {
                        res.render("napthe", { userdata: cuser, err_msg: "serial c???n 11 ho???c 14 k?? t???", rmoney: user.rmoney })
                    }
                }
                else {
                    res.render("napthe", { userdata: cuser, err_msg: "M?? Th??? c???n 13 ho???c 15 k?? t???", rmoney: user.rmoney })
                }
            }

        })
    }




})


module.exports = router

