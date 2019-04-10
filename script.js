const fs = require('fs');
const parser = require("xml2js").Parser({ attrkey: "key" });
const $ = require('cheerio').load('<container></container>');


// Sets up some basic information and variables
var input = [];
var output = [];
var date = new Date(Date.now());
var foldername = ("0" + date.getDate()).slice(-2) + "." +
    ("0" + (date.getMonth() + 1)).slice(-2) + "." + 
    date.getFullYear() + "-" +
    ("0" + date.getHours()).slice(-2) + "." +
    ("0" + date.getMinutes()).slice(-2) + " - " +
    Math.random().toString(36).substr(2, 9).toUpperCase();

console.log("Script started...");

// Step 1: Creates a folder for this Script execution.
// All processed xml contents will be stored within
// Step 2: Reads the contents of the _input-folder.
// Checks for the right extension (xml). Each file
// represents a backup with and will be pushed into the
// input array.
// Step 3: Calls a function for each index of the input 
// array, that further processes the input files.

fs.readdir('_input/', (error, files)  => {
    if (error) {
        return console.log("[\x1b[31m\x1b[1mERR\x1b[37m\x1b[0m] " + error);
    }
    try {
        // Step 1
        fs.mkdir("_output/" + foldername, (error) => {
            if (error) {
                return console.log("[\x1b[31m\x1b[1mERR\x1b[37m\x1b[0m] " + error);
            }
        });

        console.log("\n======================================");
        console.log("Reading '_input'-folder (" + files.length + " files)...");
        console.log("======================================");
        // Step 2
        files.forEach((file) => {
            if (getExtension(file) == "xml") {
                console.log("[\x1b[32m\x1b[1mOK \x1b[37m\x1b[0m] - '" + file + "' will be processed.");
                input.push(file);
            } else {
                console.log("[\x1b[31m\x1b[1mERR\x1b[37m\x1b[0m] - '" + file + "' is not a xml file.");
            }
        });

        console.log("\n======================================");
        console.log("Processing xml files...");
        console.log("======================================");

        // Step 3
        for (var i = 0; i < input.length; i++) {
            processXMLFile(input[i]);
        }
    } catch (error) {
        return console.log("[\x1b[31m\x1b[0mERR\x1b[37m\x1b[0m] " + error);
    }
});

// Step 1: Reads the contents of an xml file into a string.
// Step 2: Parses the string into a json object.
// Step 3: Iterates through the backup-json object.
// Step 3.1: For each question: 
// Creates an empty object in the output array.
// Step 3.2: For each question: 
// Pushes the questionname to the currently processed object.
// Step 3.3. For each question:
// Pushes the images to the currently processed object.
// Step 4: Calls a function that stores all images to the filedisk

processXMLFile = (xmlFile) => {
    try {
        // Step 1
        fs.readFile('_input/' + xmlFile, 'utf8', (error, xmlcontent) => {
            if (error) {
                return console.log("[\x1b[31m\x1b[1mERR\x1b[37m\x1b[0m] " + xmlFile + " - " + error);
            }
            // Step 2
            console.log("      - Start extracting images of '" + xmlFile + "'");
            parser.parseString(xmlcontent, (error, result) => {
                if (error) {
                    return console.log("[\x1b[31m\x1b[1mERR\x1b[37m\x1b[0m] " + xmlFile + " - " + error);
                }
                for (var index in result.quiz.question) {
                    // Step 3.1
                    createQuestionIndex(index);
                    // Step 3.2
                    pushQuestiontext(result.quiz.question[index], index);
                    // Step 3.3
                    if(!output[index].error) {
                        pushImages(result.quiz.question[index], index);
                    }
                }
                // Step 4
                saveImages(xmlFile);
                console.log("[\x1b[32m\x1b[1mOK \x1b[37m\x1b[0m] - Finished extraxting images out of " + output.length + " questions in '" + xmlFile + "'");
            });
        });
    } catch (error) {
        return console.log("[\x1b[31m\x1b[1mERR\x1b[37m\x1b[0m] " + error);  
    }
}



createQuestionIndex = (index) => {
    output[index] = {name: null, content: [], error: false};
}

pushQuestiontext = (question, index) => {
    try {
        if (question.name) {
            output[index].name = question.name[0].text[0];
        }
    } catch (error) {
        output[index].error = true;
        return console.log("[\x1b[31m\x1b[1mERR\x1b[37m\x1b[0m] " + error);
    }
}


pushImages = (question, index) => {
    // (1) questiontext
    // (1) questionfeedback
    // (n) answer
    // (n) answer -> (m) answerfeedback
    try {
        if (question.questiontext) {
            // question.questiontext[0].text[0]
            extractBase64(question.questiontext[0], index);
         }
         if (question.generalfeedback) {
             // question.generalfeedback[0].text[0]
             extractBase64(question.generalfeedback[0], index);
         }
         if (question.answer) {
             for (var i in question.answer) {
                 // question.answer[i].text[0]
                 extractBase64(question.answer[i], index);
     
                 for(var j in question.answer[i].feedback) {
                     // question.answer[i].feedback[j].text[0]
                     extractBase64(question.answer[i].feedback[j], index);
                 }
             }
         }
    } catch (error) {
        output[index].error = true;
        return console.log("[\x1b[31m\x1b[1mERR\x1b[37m\x1b[0m] " + error);
    }
}

// Step 1: Looks for base64 strings in questiontext -> text tag
// Step 2: Looks for base64 strings in generalfeedback -> text tag
// Step 3: Looks for base64 strings in the file tag
// Note: All found strings ar pushed to the currently processed 
// question object in the output array

extractBase64 = (string, index) => {
    try {
        // Step 1
        // Step 2
        $("container").html(string.text[0]);


        $("img").each(function () { 
            if($(this).attr("src").indexOf("data:image/png;base64") !== -1) {
                output[index].content.push($(this).attr("src").replace("data:image/png;base64,", ""));
            } 
            else if ($(this).attr("src").indexOf("data:image/jpg;base64") !== -1) {
                output[index].content.push($(this).attr("src").replace("data:image/jpg;base64,", ""));
            }
            else if ($(this).attr("src").indexOf("data:image/gif;base64") !== -1) {
                output[index].content.push($(this).attr("src").replace("data:image/gif;base64,", ""));
            }
        }); 
        // Step 3
        if (string.file) {
            for(var i in string.file) {
                output[index].content.push(string.file[i]["_"]);
            }
        }
    } catch (error) {
        return console.log("[\x1b[31m\x1b[1mERR\x1b[37m\x1b[0m] " + error);  
    }
}

// Step 1: Creates a folder for the currently processed xml file.
// Step 2.1: Loops over the output array (each index = question)
// Step 2.2: Loops over output[index].content (each index = base64 string)
// Step 2.3: Saves each base64 string as .png to the filedisk

saveImages = (xmlFile) => {
    try {
        // Step 1
        fs.mkdir("_output/" + foldername + "/" + xmlFile, (error) => {
            if (error) {
                return console.log("[\x1b[31m\x1b[1mERR\x1b[37m\x1b[0m] " + xmlFile + " - " + error);
            }
        });
        // Step 2.1
        for (var i in output) {
            if(!output[i].error && output[i].name != null && output[i].content.length > 0) {
                // Step 2.2
                for (var j in output[i].content) {
                    // Step 2.3
                    writeImage(output, xmlFile, i, j);
                }
            }
        }
    } catch (error) {
        return console.log("[\x1b[31m\x1b[1mERR\x1b[37m\x1b[0m] " + error);     
    }
}

writeImage = async(output, xmlFile, i, j) => {
    var filename = output[i].name.replace(/\//g, "-");
    filename = filename.replace(/[^a-zA-Z0-9() ]/g, "");
    filename = filename.replace(/\s/g,"_");

    fs.writeFile("_output/" + foldername + "/" + xmlFile + "/" + filename + "_" + j + ".png", 
    output[i].content[j], 'base64', (error) => {
        if (error) {
            return console.log("[\x1b[31m\x1b[1mERR\x1b[37m\x1b[0m] " + xmlFile + " - " + error);
        }
    });
}



getExtension = (filename) => {
    return filename.split('.').pop();
}