# xmlparser

## What it is:
A simple script that extracts all images of Moodle Course Backup files.
The backup files must be in xml-format.


## Installation:
1. Install [Node.js](https://nodejs.org/en/)
1. Switch into the xmlparser folder using the terminal.
1. Run `npm install` to setup the script's dependencies.
1. Create two empty directories "_input" and "_output" within xmlparser folder.
1. Make sure the executing user has sufficient permissions to access the _output folder in write-mode.


## How the script works:
1. Put all xml files you want to process into the _input folder.
1. Enter a terminal and run `node script.js` or `npm start`.

The script checks for all xml files in the _input folder.
Each xml files images will be stored in the _output folder.


## Possible errors that may occur:
> [ERR] - ... is not a xml file.

* One of the files in the _input folder is not a file of type xml.
* All files in the input folder need to be in xml format.

> [ERR] ... - Error: Non-whitespace before first tag.

* The script opened the xml file but it does not contain xml content.
This may be caused when the original backup has not been saved as xml or when somebody messed with the file's contents.

> [ERR] TypeError: Cannot read property '...' of undefined

* This error occurs if the xml's content is xml but it's filestructure is not in moodle format.
* Otherwise there may be changes to the moodle backup filestructure that need to be applied to the script in order to work correctly again. This needs some fixes to the script.