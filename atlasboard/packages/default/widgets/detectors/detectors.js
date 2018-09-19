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

    $('#house').attr('points', "10,10 900,10 900,120 1200,120 1200,700 400,700 400, 800 10,800");
    $('#batcave').attr('points', "400,400 690,400 690,690 400,690");

    //Registers the caller function in localStorage when socket is updated, 
    //TODO: Update in a common library instead;
    //Use events instead?
    window.stateUpdate = [ this.onSocketUpdate, el, data, this ];
  },

  onSocketUpdate: function(el, data, parent){
    console.log(`>>>> Updating socket data...`);
    parent.onItemUpdate($('#data_sala', el), 
      data["mihome.0.devices.sensor_ht_158d000208fc30.temperature"]);
    parent.onItemUpdate($('#data_batcave', el), 
      data["mihome.0.devices.sensor_ht_158d00020db386.temperature"]);
    parent.onItemUpdate($('#data_bedroom', el), 
      data["mihome.0.devices.sensor_ht_158d0001f54051.temperature"]);
    parent.onItemUpdate($('#s_mijia_connected', el), 
      data["system.adapter.mihome.0.connected"], "gateway", "");
    parent.onItemUpdate($('#s_data_batcave_closet', el), 
      data["mihome.0.devices.magnet_158d00022d2f5d.state"], "open", "closed");
    parent.onItemUpdate($('#s_data_batcave_person', el), 
      data["mihome.0.devices.sensor_motion_aq2_158d000237aa80.state"], "person", "");
    parent.onItemUpdate($('#s_data_batcave_lamp', el), 
      data["yeelight-2.0.yeelight-2.0.yeelight-2.0.stripe-Light_strip"], "lamp", "");
    console.log(">>>> Finished updating socket data...");
  },

  onItemUpdate(el, data, classTrue, classFalse){
    if (data){
      if (typeof data.val === "boolean"){
        el.removeClass(`${classTrue} ${classFalse}`);
        el.addClass(data.val ? classTrue : classFalse);
      } else {
        el.html(data.val);
      }
    }
  }
};