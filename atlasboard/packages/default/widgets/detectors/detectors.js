widget = {
  //runs when we receive data from the job
  onData: function (el, data) {

    //The parameters our job passed through are in the data object
    //el is our widget element, so our actions should all be relative to that
    if (data.title) {
      $('h2', el).text(data.title);
    }
    let allData = data.data;
    if(allData && !data.useSocket){
      console.log(allData);
      $('#data_sala', el).html(`${allData.sala_data ? allData.sala_data.val : "?"}&deg`);
      $('#data_batcave', el).html(`${allData.batcave_data ? allData.batcave_data.val : "?"}&deg`);
      $('#data_bedroom', el).html(`${allData.bedroom_data ? allData.bedroom_data.val : "?"}&deg`);
    }
    let d = data.divisions;
    $("#plan", el).empty();
    for (let i in d){
      $("#plan", el).append(this.makeSVG("polygon", { id: i, points: d[i] })); //  `<polygon id="${i}" />`); // points="${d[i]}"/>`);
    }
    //alert($("#plan, el").children().length());
    //Registers the caller function in localStorage when socket is updated, 
    //TODO: Update in a common library instead;
    //Use events instead?
    window.stateUpdate = [ this.onSocketUpdate, el, data, this ];
  },

  onSocketUpdate: function(el, data, parent, widgetData){
    console.log(`>>>> Updating socket data...`);
    let s = widgetData.sensors;
    for(let i in s){
      let value = s[i];
      if(Array.isArray(value)){
        parent.onItemUpdate($(`#${i}`, el), data[value[0]], value[1], value[2]);
      } else {
        parent.onItemUpdate($(`#${i}`, el), data[value]);
      }
    }
    console.log(">>>> Finished updating socket data...");
  },

  onItemUpdate(el, data, classTrue, classFalse){
    if (data){
      if (typeof data.val === "boolean"){
        el.removeClass(`${classTrue} ${classFalse}`);
        el.addClass(data.val ? classTrue : classFalse);
        //if (data.val)
          //Experimental, will not use it
          //this.addTimer(classTrue, el);
      } else {
        el.html(data.val);
      }
    }
  },

  addTimer(name_class, el){
    switch(name_class){
      //case "person":
      case "open":
        if(!el.children().length){
          let t = $('<div class="timer">60<div/>');
          el.append(t);
          let _this = this;
          setInterval(_this.decreaseTimer.bind(null, t), 1000);
        }
        break;
      default:
        break;
    }
  },

  decreaseTimer(t){
    let _t = parseInt(t.text());
    if (_t == 0){
      t.remove();
      return;
    }
    t.text(_t-1);
  },

  makeSVG(tag, attrs) {
    let el= document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs)
      el.setAttribute(k, attrs[k]);
    return el;
  }
};