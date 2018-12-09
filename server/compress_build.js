'use strict';
var fs = require('fs');
var archiver = require('archiver');

var output = fs.createWriteStream(__dirname + '/Biotops.zip');
var archive = archiver('zip', {zlib: { level: 9 }});

output.on('close', function() {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
});

archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
        console.warn(err);
    } else {
        throw err;
    }
});

archive.on('error', function(err) {
    throw err;
});

// pipe archive data to the file
archive.pipe(output);

archive.directory('dist/app', 'app');
archive.directory('dist/public', 'public');
archive.directory('dist/session_store', 'session_store');
archive.directory('dist/uploads', 'uploads');
archive.file('dist/index.js', { name: 'index.js' });
archive.file('biotops.json', { name: 'biotops.json' });
archive.file('package.json', { name: 'package.json' });

archive.finalize();