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
    $('#sala').attr('points', "20,20 250,20 250,140 390,140 390,690 20,690");
    $('#balcony').attr('points', "20,700 390,700 390,790 20,790");

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
    parent.onItemUpdate($('#data_sala_humidity', el), 
      data["mihome.0.devices.sensor_ht_158d000208fc30.humidity"]);
    parent.onItemUpdate($('#data_batcave_humidity', el), 
      data["mihome.0.devices.sensor_ht_158d00020db386.humidity"]);
    parent.onItemUpdate($('#data_bedroom_humidity', el), 
      data["mihome.0.devices.sensor_ht_158d0001f54051.humidity"]);
    parent.onItemUpdate($('#s_mijia_connected', el), 
      data["system.adapter.mihome.0.connected"], "gateway", "");
    parent.onItemUpdate($('#s_data_street_door', el), 
      data["mihome.0.devices.magnet_158d00016c1eea.state"], "open", "closed");
    parent.onItemUpdate($('#s_data_kitchen_freezer', el), 
      data["mihome.0.devices.magnet_158d00020468a4.state"], "open", "closed");
    parent.onItemUpdate($('#s_data_batcave_closet', el), 
      data["mihome.0.devices.magnet_158d00022d2f5d.state"], "open", "closed");
    parent.onItemUpdate($('s_data_balcony_door', el), 
      data["mihome.0.devices.magnet_158d00022da804.state"], "open", "closed");
    parent.onItemUpdate($('#s_data_balcony_person', el), 
      data["mihome.0.devices.sensor_motion_aq2_158d000272bd25.state"], "person", "");
    parent.onItemUpdate($('#s_data_balcony_person', el), 
      data["mihome.0.devices.sensor_motion_aq2_158d000272bd25.state"], "person", "");
    parent.onItemUpdate($('#s_data_batcave_person', el), 
      data["mihome.0.devices.sensor_motion_aq2_158d000237aa80.state"], "person", "");
    parent.onItemUpdate($('#s_data_batcave_smoke', el), 
      data["mihome.0.devices.smoke_158d0001db94c4.state"], "smoke", "");
    parent.onItemUpdate($('#s_data_bedroom_person', el), 
      data["mihome.0.devices.sensor_motion_aq2_158d000276d3fa.state"], "person", "");
    parent.onItemUpdate($('#s_data_batcave_lamp', el), 
      data["yeelight-2.0.yeelight-2.0.yeelight-2.0.stripe-Light_strip"], "lamp", "");
    parent.onItemUpdate($('#data_balcony', el), 
      data["mihome.0.devices.sensor_ht_158d000237950b.temperature"]);
    parent.onItemUpdate($('#data_balcony_humidity', el), 
      data["mihome.0.devices.sensor_ht_158d000237950b.humidity"]);

    console.log(">>>> Finished updating socket data...");
  },
  //mihome.0.devices.smoke_158d0001db94c4
  //mihome.0.devices.switch_158d000255c528

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