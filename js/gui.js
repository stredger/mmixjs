
function generateExampleCode() {
  return ['a\tIS\t$0','b\tIS\t$1','c\tIS\t$2','d\tIS\t$3','zero\tGREG\t0','',
          'Main\tADD\ta,zero,1','\tADD\tb,zero,-2','\tSUB\tc,a,b','\tSUB\td,b,a',
          '\tTRAP\t0,Halt,0'].join('\n'); 
}

function showSuccess(numops) {
  var html = ['<div class="alert alert-success alert-dismissable fade in">',
              '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>',
              '<strong>Success!</strong> Ran', numops ,'mmix operation(s).</div>'].join(' ');
  $('#alertarea').prepend(html);
}

function showFailure(err, lineno) {
  var html = ['<div class="alert alert-danger alert-dismissable fade in">',
              '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>',
              '<strong>Failure!</strong> Line:', lineno, ':', err ,'</div>'].join(' ');
  $('#alertarea').prepend(html);
}

function showWarning(msg) {
  var html = ['<div class="alert alert-warning alert-dismissable fade in">',
              '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>',
              '<strong>Warning!</strong> ', msg ,' </div>'].join('');
  $('#alertarea').prepend(html);
}

function updateSelectedLine(lineno) {
  $('.lineselect').removeClass('lineselect');
  $('.lineno').each(function (index) {
    var t = $(this);
    if (t.text() == lineno) {
      t.addClass('lineselect');
      return false;
    }
  });
}

function findMainLineNo() {
  var textlines = $('.lined').val().split('\n');
  for (var i = 0; i < textlines.length; i++) {
    if ('Main' == textlines[i].split('\t')[0]) {
      return i + 1;
    }
  }
  showWarning('No Main Label! Execution starts at the lable: Main');
  return -1;
}


function displayRegisters() {
  var html;
  for (reg in Registers) {
    html += ['<tr><td>', reg, '</td><td>', Registers[reg].inspect(), '</td></tr>'].join('');
  }
  var table = $('#regtable tbody');
  table.children('tr').remove();
  table.append(html);
}

function displayMemory() {
  var html;
  for (cell in Memory) {
    html += ['<tr><td>', cell, '</td><td>', Memory[cell].inspect(), '</td></tr>'].join('');
  }
  var table = $('#memtable tbody');
  table.children('tr').remove();
  table.append(html);
}


function loadExampleCode(fname) {
  $.get('../mms/' + fname, function(data) {
    $('#codearea').val(data);
  });
}


$(function() {

  // read a text file and place it in the code area
  $('#fileinput').change(function () {
    var f = this.files[0];
    var reader = new FileReader();
    reader.onload = function() {
      $('#codearea').val(reader.result);
    }
    reader.readAsText(f);
  });

  // run whatever is in the code area in the mmix interpreter
  $('#runbtn').click(function() {
    var data = $('#codearea').val();
    var src = parseRawText(data);
    // gregptr = 255;
    initInterpreter()
    loadIntoMem(src);
    iptr = Labels['Main'];
    try {
      var numops = run();
      displayRegisters();
      displayMemory();
      showSuccess(numops);
      iptr = 'undefined';
      updateSelectedLine(findMainLineNo());      
    } catch(err) {
      showFailure(err, iptr/4);
      throw err;
    }
  });

  // step through the code one line at a time
  $('#stepbtn').click(function() {
    if (iptr === 'undefined') {
      var data = $('#codearea').val();
      var src = parseRawText(data);
      initInterpreter()
      loadIntoMem(src);
      iptr = Labels['Main'];
    }
    try {
      var numops = run(1);
      displayRegisters();
      displayMemory();
      updateSelectedLine(iptr/4 + 1); // +1 as the array starts from 0
      showSuccess(numops);
   } catch(err) {
     showFailure(err, iptr/4);
     throw err;
   }
  });

  $('#rstbtn').click(function() {
    iptr = 'undefined';
    updateSelectedLine(findMainLineNo());
    initInterpreter();
    displayRegisters();
    displayMemory();
  });

  $('#regbtn').click(function() {
    displayRegisters();
  });

  // capture tab presses in the textarea and insert an actual tab
  $('#codearea').keydown(function(key) {
    if(key.keyCode == 9 || event.which == 9) {
      key.preventDefault();
      var s = this.selectionStart;
      this.value = [this.value.substring(0, this.selectionStart), '\t', this.value.substring(this.selectionEnd)].join('');
      this.selectionEnd = s + 1; 
    }
  });


  $("#exampledd a").click(function(e){
    loadExampleCode(this.text);
    e.preventDefault();
  });

  // give the code area line numbers
  $('.lined').val(generateExampleCode());
  $('.lined').linedtextarea({selectedLine: findMainLineNo()});
});
