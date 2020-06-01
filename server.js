const express = require('express')
const fileUpload = require('express-fileupload')
const ffmpeg = require('ffmpeg')
const { uuid } = require('uuidv4')
const fs = require('fs')


const app = express()
app.use(fileUpload())

let questFile = "quest.json";

let icons = ["books.png",
            "soccerball.png", 
            "macandcheese.png", 
            "chemistry.jpg",
            "blackcat.png",
            "christmastree.jpg",
            "rollerskates.jpg",
            "diploma.jpg"];

function addNewPage(vals, answer, hint, pageTitle) {

    let oldPages = JSON.parse(fs.readFileSync(questFile));

    let newPage = {
            mapIcon: "/images/icons/" + icons[oldPages.length],
            hint: hint,
            elements: [
                {
                    type: "scrollingText",
                    content: vals,
                    options: {
                        fadeIn: 1200
                    }
                },
                {
                    type: "inputText",
                    content: "",
                    validation: {
                        validationType: "text",
                        value: answer,
                        options: {
                            caseInsensitive: true
                        }
                    },
                    options: {
                        fadeIn: 1200
                    }
                }
            ]
    };

    
    oldPages.push(newPage);
    fs.writeFileSync(questFile, JSON.stringify(oldPages));
}


app.post('/upload', async (req, res) => {
    if (req.files === null) {
        return res.status(400).json({msg: "No file uploaded"})
    }
    const file = req.files.file;
    const {pageTitle, answer, hint} = req.body;
    const src = "/uploads/" + uuid() + ".mp3";
    const lines = JSON.parse(req.body.lines);

    let tmpFilePath = `${__dirname}/client/public/tmpblob`;
    let audioFilePath = `${__dirname}/client/public${src}`;


    try {
        await file.mv(tmpFilePath);
        console.log("got here")
        let process = new ffmpeg(tmpFilePath);
        process.then(function(audio) {
            audio.fnExtractSoundToMP3(audioFilePath, function(error, newFile) {
                if (!error) {
                    console.log("Audio file:", newFile);
                    addNewPage({ src,  lines }, answer, hint, pageTitle);
                    res.json({name: pageTitle, src, lines })
                } else {
                    console.log("Error:", error)
                }
            });
        }, function (err) {
            console.log("Error:", err);
        });
    } catch (e) {
        console.log(err);
        return res.status(500).send(err);
    }

    /*
    
    file.mv(path, err => {
        if (err) {
            console.log(err);
            return res.status(500).send(err);
        }
        console.log("server success")
        addNewPage({ src,  lines }, answer, hint, pageTitle);
        res.json({name: pageTitle, src, lines })
    })
    */
});

app.listen(5000, () => console.log("Server started"));