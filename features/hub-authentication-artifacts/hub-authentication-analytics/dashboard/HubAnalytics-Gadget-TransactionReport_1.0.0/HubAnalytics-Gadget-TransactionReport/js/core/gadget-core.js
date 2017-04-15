/*
 * Copyright (c) 2016, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
$(function () {
    var gadgetLocation;
    var conf;
    var schema;
    var pref = new gadgets.Prefs();

    var refreshInterval;
    var providerData;

    var CHART_CONF = 'chart-conf';
    var PROVIDER_CONF = 'provider-conf';

    var REFRESH_INTERVAL = 'refreshInterval';
    //var operatorId = 0, serviceProviderId = 0, apiId = 0, applicationId = 0, apiN='';
    var operatorName = "all", serviceProviderId = 0, apiId = 0, applicationId = 0, apiN='';
    var role;
    var selectedOperator;
    var operatorSelected = false;

    var init = function () {

        $.ajax({
            url: gadgetLocation + '/conf.json',
            method: "GET",
            contentType: "application/json",
            async: false,
            success: function (data) {
                conf = JSON.parse(data);

                if (operatorSelected) {
                    conf.operatorName = selectedOperator;
                } else {
                   conf.operatorName = operatorName;
                }
//TODO:remove this conf.operator
                //conf.operator = operatorId;
                conf.serviceProvider = serviceProviderId;
                conf.api = apiId;
                conf.applicationName = applicationId;
                conf.apiName = apiN;


                //this call is not success
                $.ajax({
                    url: gadgetLocation + '/gadget-controller.jag?action=getSchema',
                    method: "POST",
                    data: JSON.stringify(conf),
                    contentType: "application/json",
                    async: false,
                    success: function (data) {
                        schema = data;
                    }
                });
            }
        });
    };

    var getProviderData = function () {

        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=getData',
            method: "POST",
            data: JSON.stringify(conf),
            contentType: "application/json",
            async: false,
            success: function (data) {
                providerData = data;
            }
        });
        return providerData;
    };
    
    
    var getRole = function () {

        conf.operator = "test";
        conf["provider-conf"]["tableName"] = "test123";
        $.ajax({
            url:gadgetLocation + '/gadget-controller.jag?action=getRole',
            method:"POST",
            data:JSON.stringify(conf),
            contentType:"application/json",
            async:false,
            success: function (data) {
                role = data.role;
                if ("operatoradmin" == role) {
                    $("#operatordd").hide();
                } else {
                    $("#operatordd").show();
                }
            }
        })
    };
    
    var getOperatorNameinProfile = function() {
        conf.operator = "test123";
        conf["provider-conf"]["tableName"] = "test";
        $.ajax({
            url:gadgetLocation + '/gadget-controller.jag?action=getProfileOperator',
            method:"POST",
            data:JSON.stringify(conf),
            contentType:"application/json",
            async: false,
            success: function (data) {
                operatorName = data.operatorName;
            }
        })
    }


    var drawGadget = function () {

        draw('#canvas', conf[CHART_CONF], schema, providerData);
        setInterval(function () {
            draw('#canvas', conf[CHART_CONF], schema, getProviderData());
        }, pref.getInt(REFRESH_INTERVAL));

    };


    $("#button-generate").click(function () {
        $("#canvas").html("");
        $("#output").html("");
        getGadgetLocation(function (gadget_Location) {
            gadgetLocation = gadget_Location;

            //conf.operator = operatorId;
            conf.serviceProvider = serviceProviderId;
            conf.api = apiId;
            conf.apiName = apiN;
            conf.applicationName = applicationId;

            conf.dateStart = moment(moment($("#reportrange").text().split("-")[0]).format("MMMM D, YYYY hh:mm A")).valueOf();
            conf.dateEnd = moment(moment($("#reportrange").text().split("-")[1]).format("MMMM D, YYYY hh:mm A")).valueOf();

            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=generate',
                method: "POST",
                data: JSON.stringify(conf),
                contentType: "application/json",
                async: false,
                success: function (data) {
                    $("#output").html('<div id="success-message" class="alert alert-success"><strong>Report is generating</strong> '
                        + "Please refresh the transaction report list"
                        + '</div>' + $("#output").html());
                    $('#success-message').fadeIn().delay(2000).fadeOut();
                }
            });


        });
    });


    $("#button-list").click(function () {
        $("#output").html("");
        getGadgetLocation(function (gadget_Location) {
            gadgetLocation = gadget_Location;
            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=available',
                method: "POST",
                data: JSON.stringify(conf),
                contentType: "application/json",
                async: false,
                success: function (data) {
                    $("#output").html("<ul class = 'list-group'>")
                    for (var i = 0; i < data.length; i++) {
                        $("#output").html($("#output").html() + "<li class = 'list-group-item'>"
                            + " <span class='btn-label'>" + data[i].name + "</span>"
                            + " <div class='btn-toolbar'>"
                            + "<a class='btn btn-primary btn-xs' onclick='downloadFile(" + data[i].index + ")'>Download</a>"
                            + "<a class='btn btn-default btn-xs' onclick='removeFile(" + data[i].index + ")'>Remove</a>"
                            + "</div>"
                            + "</li>");
                    }
                    $("#output").html($("#output").html() + "<ul/>")

                }
            });


        });
    });


    getGadgetLocation(function (gadget_Location) {
        gadgetLocation = gadget_Location;
        init();
        getRole();
        loadOperator();
        // loadSP();
        // loadApp();
        // loadApi();

        //TODO:conf.operator change according to previous -- remove conf.operator
        //we can use operatorId instead of operatorName
          function loadOperator (){
                      conf["provider-conf"]["tableName"] = "ORG_WSO2TELCO_ANALYTICS_HUB_STREAM_OPERATOR_SUMMARY";
                      conf["provider-conf"]["provider-name"] = "operator";
                      //conf.operator = 0;
                      //operatorId = 0;
              operatorName = "all";
                      $.ajax({
                          url: gadgetLocation + '/gadget-controller.jag?action=getData',
                          method: "POST",
                          data: JSON.stringify(conf),
                          contentType: "application/json",
                          async: false,
                          success: function (data) {
                              $("#dropdown-operator").empty();
                              var operatorsItems = "";
                              //var operatorIds = [];
                              var operatorNames = [];
                              var loadedOperator = [];
                              //operatorIds.push(operatorId);
                              operatorNames.push(operatorName);
                              operatorsItems += '<li><a data-val="0" href="#">All</a></li>';
                              for (var i =0 ; i < data.length; i++) {
                                  var operator = data[i];
                                  //if($.inArray(operator.operatorId, loadedOperator)<0){
                                  if($.inArray(operator.operatorName, loadedOperator)<0){
                                  //operatorsItems += '<li><a data-val='+ operator.operatorId +' href="#">' + operator.operatorName +'</a></li>';
                                  operatorsItems += '<li><a data-val='+ operator.operatorName +' href="#">' + operator.operatorName +'</a></li>';
                                  //operatorIds.push(" "+operator.operatorId);
                                  operatorNames.push(" "+operator.operatorName);
                                  //loadedOperator.push(operator.operatorId);
                                  loadedOperator.push(operator.operatorName);
                                }
                              }
                              $("#dropdown-operator").html( $("#dropdown-operator").html() + operatorsItems);
                              $("#button-operator").val('<li><a data-val="0" href="#">All</a></li>');
                              //loadSP(operatorIds);

                              if ("operatoradmin" == role) {
                                  getOperatorNameinProfile();
                                  loadSP(operatorName);
                              } else {
                                  //loadSP(operatorIds);
                                  loadSP(operatorNames);

                              }

                              $("#dropdown-operator li a").click(function(){
                                  $("#button-operator").text($(this).text());
                                  $("#button-operator").append('<span class="caret"></span>');
                                  $("#button-operator").val($(this).text());
                                  //operatorIds = $(this).data('val');
                                  operatorNames = $(this).data('val');
                                  //loadSP(operatorIds);
                                  loadSP(operatorNames);
                                  operatorSelected = true;
                              });
                          }
                      });
                    }
//TODO:conf operatorName usage in everywhere
          function loadSP (clickedOperator){

            conf["provider-conf"]["tableName"] = "ORG_WSO2TELCO_ANALYTICS_HUB_STREAM_API_SUMMARY";
            conf["provider-conf"]["provider-name"] = "operator";
            //conf.operator =  "("+clickedOperator+")";
            conf.operatorName =  "("+clickedOperator+")";
            selectedOperator = conf.operatorName;

            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=getData',
                method: "POST",
                data: JSON.stringify(conf),
                contentType: "application/json",
                async: false,
                success: function (data) {
                    $("#dropdown-sp").empty();
                    var spItems = '';
                    var spIds = [];
                    var loadedSps = [];
                    spIds.push(serviceProviderId);
                    spItems += '<li><a data-val="0" href="#">All</a></li>';
                    for ( var i =0 ; i < data.length; i++) {
                        var sp = data[i];
                        if($.inArray(sp.serviceProviderId, loadedSps)<0){
                        spItems += '<li><a data-val='+ sp.serviceProviderId +' href="#">' + sp.serviceProvider.replace("@carbon.super","") +'</a></li>'
                        spIds.push(" "+sp.serviceProviderId);
                        loadedSps.push(sp.serviceProviderId);
                      }
                    }

                    $("#dropdown-sp").html(spItems);

                    $("#button-sp").text('All');
                    $("#button-sp").val('<li><a data-val="0" href="#">All</a></li>');
                    loadApp(spIds);
                    $("#dropdown-sp li a").click(function(){

                        $("#button-sp").text($(this).text());
                        $("#button-sp").append('<span class="caret"></span>');
                        $("#button-sp").val($(this).text());
                        // var clickedSP = [];
                        // clickedSP.push($(this).data('val'));
                        spIds = $(this).data('val');
                        serviceProviderId = spIds;
                        loadApp(spIds);
                    });


                }
            });
        }

        function loadApp (sps){

        conf["provider-conf"]["tableName"] = "ORG_WSO2TELCO_ANALYTICS_HUB_STREAM_API_SUMMARY";
        conf["provider-conf"]["provider-name"] = "sp";
        conf.serviceProvider = "("+sps+")";
        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=getData',
            method: "POST",
            data: JSON.stringify(conf),
            contentType: "application/json",
            async: false,
            success: function (data) {

                $("#dropdown-app").empty();
                var apps = [];
                var loadedApps = [];
                var appItems = '<li><a data-val="0" href="#">All</a></li>';
                apps.push(applicationId);
                for ( var i =0 ; i < data.length; i++) {
                    var app = data[i];
                    if($.inArray(app.applicationId, loadedApps)<0){
                    appItems += '<li><a data-val='+ app.applicationId +' href="#">' + app.applicationName +'</a></li>'
                    apps.push(" "+app.applicationId);
                    loadedApps.push(app.applicationId);
                  }
                }

                $("#dropdown-app").html( $("#dropdown-app").html() + appItems);
                $("#button-app").val('<li><a data-val="0" href="#">All</a></li>');
                $("#button-app").text('All');
                // loadApp(sps[i]);

                loadApi(apps);

                $("#dropdown-app li a").click(function(){

                    $("#button-app").text($(this).text());
                    $("#button-app").append('<span class="caret"></span>');
                    $("#button-app").val($(this).text());
                    // var clickedSP = [];
                    // clickedSP.push($(this).data('val'));
                    apps = $(this).data('val');
                    applicationId = apps;
                    loadApi(apps);
                });

            }
        });
      }

      function loadApi (apps){
      conf["provider-conf"]["tableName"] = "ORG_WSO2TELCO_ANALYTICS_HUB_STREAM_API_SUMMARY";
      conf["provider-conf"]["provider-name"] = "app";
      conf.applicationId = "("+apps+")";;
      apiId = 0;
      apiN ='';
      $.ajax({
          url: gadgetLocation + '/gadget-controller.jag?action=getData',
          method: "POST",
          data: JSON.stringify(conf),
          contentType: "application/json",
          async: false,
          success: function (data) {

              $("#dropdown-api").empty();
              var apis = [];
              var loadedApis = [];
              var apiItems = '<li><a data-val="0" href="#">All</a></li>';
              for ( var i =0 ; i < data.length; i++) {
                  var api = data[i];
                  if($.inArray(api.apiID, loadedApis)<0){
                  apiItems += '<li><a data-val='+ api.apiID +' href="#">' + api.api +'</a></li>';
                  loadedApis.push(api.apiID);
                }
              }

              $("#dropdown-api").html( $("#dropdown-api").html() + apiItems);
              $("#button-api").val('<li><a data-val="0" href="#">All</a></li>');
              $("#button-api").text('All');
              // loadApp(sps[i]);
              $("#dropdown-api li a").click(function(){
                  $("#button-api").text($(this).text());
                  $("#button-api").append('<span class="caret"></span>');
                  $("#button-api").val($(this).text());
                  apiId = $(this).data('val');
                  apiN = $(this).text();
              });

          }
      });
    }
        $("#button-app").val("All");
        $("#button-api").val("All");
    });
});


function removeFile(index) {
    getGadgetLocation(function (gadget_Location) {
        gadgetLocation = gadget_Location;
        $.ajax({
            url: gadgetLocation + '/gadget-controller.jag?action=remove&index=' + index,
            method: "POST",
            contentType: "application/json",
            async: false,
            success: function (data) {
                $("#button-list").click();
            }
        });
    });
}


function downloadFile(index) {
    getGadgetLocation(function (gadget_Location) {
        gadgetLocation = gadget_Location;

        location.href = gadgetLocation + '/gadget-controller.jag?action=get&index=' + index;

    });
}
