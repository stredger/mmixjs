
function generateExampleCode() {
  return ['a\tIS\t$0','b\tIS\t$1','c\tIS\t$2','d\tIS\t$3','zero\tGREG\t0','',
          'Main\tADD\ta,zero,1','\tADD\tb,zero,-2','\tSUB\tc,a,b','\tSUB\td,b,a',
          '\tTRAP\t0,Halt,0'].join('\n'); 
}

function showSuccess(numops) {
  var html = ['<div class="alert alert-success alert-dismissable">',
              '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>',
              '<strong>Success!</strong> Ran', numops ,'mmix operations.</div>'].join(' ');
  $('#alertarea').append(html);
}

function showFailure(err) {
  var html = ['<div class="alert alert-danger alert-dismissable">',
              '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>',
              '<strong>Failure!</strong> ', err ,'</div>'].join('');
  $('#alertarea').append(html);
}

function showWarning(msg) {
  var html = ['<div class="alert alert-warning alert-dismissable">',
              '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>',
              '<strong>Warning!</strong> ', msg ,' </div>'].join('');
  $('#alertarea').append(html);
}

function displayRegisters() {
  var html;
  for (reg in Registers) {
    html += ['<tr><td>', reg, '</td><td>', Registers[reg].inspect(), '</td></tr>'].join('');
  }
  var table = $('#regtable tbody')
  table.children('tr').remove();
  table.append(html);
}

function displayMemory() {
  var html;
  for (reg in Registers) {
    html += ['<tr><td>', reg, '</td><td>', Registers[reg].inspect(), '</td></tr>'].join('');
  }
  var table = $('#regtable tbody')
  table.children('tr').remove();
  table.append(html);
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
    gregptr = 255
    loadIntoMem(src);
    iptr = Labels['Main'];
    try {
      var numops = run();
      displayRegisters();
      displayMemory();
      showSuccess(numops);
    } catch(err) {
      showFailure(err);
      throw err;
    }
  });

  // step through the code one line at a time
  $('#stepbtn').click(function() {
    if (iptr === 'undefined') {
      var data = $('#codearea').val();
      var src = parseRawText(data);
      gregptr = 255
      loadIntoMem(src);
      iptr = Labels['Main'];
    }
    try {
      var numops = run(1);
      displayRegisters();
      displayMemory();
      showSuccess(numops);
   } catch(err) {
     showFailure(err);
     throw err;
   }
  });

  // step through the code one line at a time
  $('#regbtn').click(function() {
    displayRegisters();
  });

  // capture tab presses in the textarea and insert an actual tab
  $('#codearea').keydown(function(key) {
    if(key.keyCode == 9 || event.which == 9) {
      key.preventDefault();
      var s = this.selectionStart;
      this.value = [this.value.substring(0, this.selectionStart), '\t', this.value.substring(this.selectionEnd)].join('');
      this.selectionEnd = s+1; 
    }
  });

  // give the code area line numbers
  $('.lined').val(generateExampleCode());
  $('.lined').linedtextarea();
});
