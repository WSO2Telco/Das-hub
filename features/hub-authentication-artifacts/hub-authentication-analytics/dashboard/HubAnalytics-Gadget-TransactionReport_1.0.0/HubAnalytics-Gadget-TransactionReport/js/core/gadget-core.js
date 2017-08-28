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
$(function() {
    
        var gadgetLocation;
        var conf;
        var schema;
        var pref = new gadgets.Prefs();
    
        var refreshInterval;
        var providerData;
        var loggedInUser;
        var operatorName = "all",
            serviceProviderId = 0,
            apiId = 0,
            applicationId = 0,
            apiN = ''
            application="0";
            
    
        var selectedOperator;
        var operatorSelected = false;
    
        var init = function() {
    
            $.ajax({
                url: gadgetLocation + '/conf.json',
                method: METHOD.GET,
                contentType: CONTENT_TYPE,
                async: false,
                success: function(data) {
                    conf = JSON.parse(data);
    
                    if (operatorSelected) {
                        conf.operatorName = selectedOperator;
                    } else {
                        conf.operatorName = operatorName;
                    }
                    conf.serviceProvider = serviceProviderId;
                    conf.api = apiId;
                    conf.applicationName = applicationId;
                    conf.application=application;
    
                    $.ajax({
                        url: gadgetLocation + '/gadget-controller.jag?action=getSchema',
                        method: METHOD.POST,
                        data: JSON.stringify(conf),
                        contentType: CONTENT_TYPE,
                        async: false,
                        success: function(data) {
                            schema = data;
                        }
                    });
                }
            });
        };
    
        var getLoggedInUser = function () {
            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=getLoggedInUser',
                method: METHOD.POST,
                data: JSON.stringify(conf),
                contentType: CONTENT_TYPE,
                async: false,
                success: function (data) {
                    loggedInUser = data.LoggedInUser;
                    operatorName = loggedInUser.operatorNameInProfile;
    
                    // hide the operator / serviceProvider drop-down according to logged in user
                    hideDropDown(loggedInUser);
                    if (!(loggedInUser.isAdmin) && (loggedInUser.isOperatorAdmin || loggedInUser.isCustomerCareUser)) {
                        $("#apiContainer").removeClass("col-top-pad");
                
                        //conf.operatorName = operatorName;
                    } else if (!(loggedInUser.isAdmin) && loggedInUser.isServiceProvider) {
                        $("#apiContainer").removeClass("col-top-pad");
                    }
                },
                complete : function (xhr, textStatus) {
                    if (xhr.status == "403") {
                        window.top.location.reload(false);
                    }
                }
            });
        };
    
        var getProviderData = function() {
            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=getData',
                method: METHOD.POST,
                data: JSON.stringify(conf),
                contentType: CONTENT_TYPE,
                async: false,
                success: function(data) {
                    providerData = data;
                }
            });
            return providerData;
        };
    
    
        var drawGadget = function() {
    
            draw('#canvas', conf[CHART_CONF], schema, providerData);
            setInterval(function() {
                draw('#canvas', conf[CHART_CONF], schema, getProviderData());
            }, pref.getInt(REFRESH_INTERVAL));
    
        };
    
    
        function getFilterdResult() {
            getLoggedInUser();
         $("#canvas").html("");
            $("#output").html("");
            getGadgetLocation(function(gadget_Location) {
                gadgetLocation = gadget_Location;
    
                if (operatorSelected) {
                    conf.operatorName = selectedOperator;
                } else {
                    conf.operatorName = operatorName;
                }
                conf.serviceProvider = serviceProviderId;
                conf.api = apiId;
                conf.apiName = apiN;
                conf.applicationName = applicationId;
                conf.application=application;
                conf.dateStart = dateStart();
                conf.dateEnd = dateEnd();
    
                $.ajax({
                    url: gadgetLocation + '/gadget-controller.jag?action=generate',
                    method: METHOD.POST,
                    data: JSON.stringify(conf),
                    contentType: CONTENT_TYPE,
                    async: false,
                    success: function(data) {
                        $("#output").html('<div id="success-message" class="alert alert-success"><strong>Report is generating</strong> ' +
                            "Please refresh the transaction report list" +
                            '</div>' + $("#output").html());
                        $('#success-message').fadeIn().delay(2000).fadeOut();
                    }
                });
    
    
            });    
        };
    
    
        $("#button-generate").click(function() {
            getLoggedInUser();
            $("#canvas").html("");
            $("#output").html("");
            getGadgetLocation(function(gadget_Location) {
                gadgetLocation = gadget_Location;
    
                if (operatorSelected) {
                    conf.operatorName = selectedOperator;
                } else {
                    conf.operatorName = operatorName;
                }
                conf.serviceProvider = serviceProviderId;
                conf.api = apiId;
                conf.apiName = apiN;
                conf.applicationName = applicationId;
                conf.applicationf=$("#button-app").text();
    			conf.operatorf=$("#button-operator").text();
    			conf.spf= $("#button-sp").text();
    			conf.apif=$("#button-api").text();
                conf.dateStart = dateStart();
                conf.dateEnd = dateEnd();
    
                $.ajax({
                    url: gadgetLocation + '/gadget-controller.jag?action=generate',
                    method: METHOD.POST,
                    data: JSON.stringify(conf),
                    contentType: CONTENT_TYPE,
                    async: false,
                    success: function(data) {
                        $("#output").html('<div id="success-message" class="alert alert-success"><strong>Report is generating</strong> ' +
                            "Please refresh the transaction report list" +
                            '</div>' + $("#output").html());
                        $('#success-message').fadeIn().delay(2000).fadeOut();
                    }
                });
    
    
            });
        });
    
    
        $("#button-list").click(function() {
            getLoggedInUser();
            $("#output").html("");
            getGadgetLocation(function(gadget_Location) {
                gadgetLocation = gadget_Location;
                $.ajax({
                    url: gadgetLocation + '/gadget-controller.jag?action=available',
                    method: METHOD.POST,
                    data: JSON.stringify(conf),
                    contentType: CONTENT_TYPE,
                    async: false,
                    success: function(data) {
                        var html = "<ul class = 'list-group'>"
                        for (var i = 0; i < data.length; i++) {
                            html  += "<li class = 'list-group-item'>" +
                                " <span class='btn-label'>" + data[i].name + "</span>" +
                                " <div class='btn-toolbar'>" +
                                "<a class='btn btn-primary btn-xs' onclick='downloadFile(" + data[i].index + ")'>Download</a>" +
                                "<a class='btn btn-default btn-xs' onclick='removeFile(" + data[i].index + ")'>Remove</a>" +
                                "</div>" +
                                "</li>";
                        }
                        html += "</ul>"
                        $("#output").html($("#output").html() + html)
                    }
                });
            });
        });
    
    
    
        getGadgetLocation(function(gadget_Location) {
            gadgetLocation = gadget_Location;
            init();
            getLoggedInUser();
            loadOperator();
    
            function loadOperator() {
                if (loggedInUser.isOperatorAdmin) {
                    loadSP(loggedInUser.operatorNameInProfile);
                } else {
                    conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.OPERATOR_SUMMERY;
                    conf[PROVIDER_CONF][PROVIDER_NAME] = TYPE.OPERATOR;
                    conf.operatorName = "all";
                    operatorName = "all";
                    $.ajax({
                        url: gadgetLocation + '/gadget-controller.jag?action=getData',
                        method: METHOD.POST,
                        data: JSON.stringify(conf),
                        contentType: CONTENT_TYPE,
                        async: false,
                        success: function (data) {
                            $("#dropdown-operator").empty();
                            var operatorsItems = "";
                            var operatorNames = [];
                            var loadedOperator = [];
                            operatorNames.push(operatorName);
                            operatorsItems += '<li><a data-val="all" href="#">All Operator</a></li>';
                            for (var i = 0; i < data.length; i++) {
                                var operator = data[i];
                                if ($.inArray(operator.operatorName, loadedOperator) < 0) {
                                    operatorsItems += '<li><a data-val=' + operator.operatorName + ' href="#">' + operator.operatorName + '</a></li>';
                                    if(operator.operatorName.toString() != "all") {
                                        operatorNames.push(" " + "\"" + operator.operatorName +"\"");
                                    }
                                    loadedOperator.push(operator.operatorName);
                                }
                            }
                            $("#dropdown-operator").html($("#dropdown-operator").html() + operatorsItems);
                            $("#button-operator").val('<li><a data-val="all" href="#">All</a></li>');
                            
    
                            operatorNames = "("+operatorNames+")";
                            loadSP(operatorNames);
                            $("#dropdown-operator li a").click(function () {
                                $("#button-operator").text($(this).text());
                                $("#button-operator").append('&nbsp;<span class="caret"></span>');
                                $("#button-operator").val($(this).text());
                               
                                if ($(this).data('val') == 'all')
                                    {loadSP(operatorNames);}
                                else {
                                    loadSP( $(this).data('val'));
                                }
                                operatorSelected = true;
                                
                            });
                        }
                    });
                }
            }
    
            function loadSP(clickedOperator) {
                conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.API_SUMMERY;
                conf[PROVIDER_CONF][PROVIDER_NAME] = TYPE.OPERATOR;
                conf.operatorName =  clickedOperator;
                selectedOperator = conf.operatorName;
                serviceProviderId = 0;
    
                if (loggedInUser.isServiceProvider) {
                    loadApp("\"" + loggedInUser.username + "\"", selectedOperator);
                } else {
                    $.ajax({
                        url: gadgetLocation + '/gadget-controller.jag?action=getData',
                        method: METHOD.POST,
                        data: JSON.stringify(conf),
                        contentType: CONTENT_TYPE,
                        async: false,
                        success: function (data) {
                            $("#dropdown-sp").empty();
                            $("#button-sp").text('All Service provider');
                            $("#button-sp").append('&nbsp;<span class="caret"></span>');
                            var spItems = '';
                            var spIds = [];
                            var loadedSps = [];
                            spIds.push(serviceProviderId);
                            spItems += '<li><a data-val="0" href="#">All Service Provider</a></li>';
                            for ( var i =0 ; i < data.length; i++) {
                                var sp = data[i];
                                if($.inArray(sp.serviceProviderId, loadedSps)<0){
                                    spItems += '<li><a data-val='+ sp.serviceProviderId +' href="#">' + sp.serviceProvider.replace("@carbon.super","") +'</a></li>'
                                    spIds.push(" "+ "\"" + sp.serviceProviderId + "\"");
                                    loadedSps.push(sp.serviceProviderId);
                                }
                            }
                            spIds = "("+spIds+")";
                            $("#dropdown-sp").html(spItems);
    
                            $("#button-sp").val('<li><a data-val="0" href="#">All Service provider</a></li>');
                            loadApp(spIds,selectedOperator);
                            $("#dropdown-sp li a").click(function(){
    
                                $("#button-sp").text($(this).text());
                                $("#button-sp").append('&nbsp;<span class="caret"></span>');
                                $("#button-sp").val($(this).text());
    
    
    //                            spIds = $(this).data('val');
                                serviceProviderId = $(this).data('val');
                                //spIds;
                                
                                // if(selectedOperator.toString() == "all") {
                                    if(serviceProviderId != "0") {
                                        loadApp( "\"" + serviceProviderId +"\"", selectedOperator.toString());
                                    } else {
                                        // if(loggedInUser.isOperatorAdmin) {
                                        //     loadSP(loggedInUser.operatorNameInProfile);
                                        // } else {
                                            loadApp(  spIds , selectedOperator.toString());
                                       // }
                                    }
                                // } else {
                                //     if(spIds != "0") {
                                //         loadApp( "\"" +spIds+"\"","\"" + selectedOperator+"\"");
                                //     } else {
                                //         if(loggedInUser.isOperatorAdmin) {
                                //             loadSP(loggedInUser.operatorNameInProfile);
                                //         } else {
                                //             loadApp(  spIds , selectedOperator.toString());
                                //         }
                                //     }
                                // }
                                
    
                            });
                        }
                    });
                }
            }
    
            function loadApp(sps, clickedOperator) {
                conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.API_SUMMERY;
                conf[PROVIDER_CONF][PROVIDER_NAME] = TYPE.SP;
                if(sps != "0") {
                    conf.serviceProvider = sps;
                }
                conf.operatorName = clickedOperator; //TODO: check this brackets.
                application="0";
                $.ajax({
                    url: gadgetLocation + '/gadget-controller.jag?action=getData',
                    method: METHOD.POST,
                    data: JSON.stringify(conf),
                    contentType: CONTENT_TYPE,
                    async: false,
                    success: function(data) {
    
                        $("#dropdown-app").empty();
                        $("#button-app").text('All Application');
                        $("#button-app").append('&nbsp;<span class="caret"></span>');
                        var apps = [];
                        var loadedApps = [];
                        var selectedApp = [];
                        var appItems = '<li><a data-val="0" href="#">All Application</a></li>';
                        //apps.push(applicationId);
                        for (var i = 0; i < data.length; i++) {
                            var app = data[i];
                            if ($.inArray(app.applicationId, loadedApps) < 0) {
                                appItems += '<li><a data-val=' + app.applicationId + ' href="#">' + app.applicationName + '</a></li>'
                                apps.push(" " + app.applicationId);
                                loadedApps.push(app.applicationId);
                            }
                        }
    
                        $("#dropdown-app").html($("#dropdown-app").html() + appItems);
                        $("#button-app").val('<li><a data-val="0" href="#">All Application</a></li>');
                        loadApi(apps);
                        $("#dropdown-app li a").click(function() {
    
                            $("#button-app").text($(this).text());
                            $("#button-app").append('&nbsp;<span class="caret"></span>');
                            $("#button-app").val($(this).text());
    
                            selectedApp = $(this).data('val');
                            applicationId = selectedApp;
                            application=$(this).text();
                            if(selectedApp == "0") {
                                loadApi(apps);
                                
                            } else {
                                loadApi(selectedApp);
                                
                            }
                        });
    
                    }
                });
            }
    
            function loadApi (apps) {
                conf[PROVIDER_CONF][TABLE_NAME] = STREAMS.API_SUMMERY;
                conf[PROVIDER_CONF][PROVIDER_NAME] = TYPE.APP;
                conf.applicationId = "("+apps+")";
                apiId = 0;
                $.ajax({
                    url: gadgetLocation + '/gadget-controller.jag?action=getData',
                    method: METHOD.POST,
                    data: JSON.stringify(conf),
                    contentType: CONTENT_TYPE,
                    async: false,
                    success: function (data) {
                        $("#dropdown-api").empty();
                        $("#button-api").text('All Api');
                        $("#button-api").append('&nbsp;<span class="caret"></span>');
                        var apis = [];
                        var loadedApis = [];
                        var apiItems = '<li><a data-val="0" href="#">All Api</a></li>';
                        for (var i = 0; i < data.length; i++) {
                            var api = data[i];
                            if ($.inArray(api.apiID, loadedApis) < 0) {
                                apiItems += '<li><a data-val=' + api.apiID + ' href="#">' + api.api + '</a></li>';
                                loadedApis.push(api.apiID);
                            }
                        }
    
                        $("#dropdown-api").html($("#dropdown-api").html() + apiItems);
                        $("#button-api").val('<li><a data-val="0" href="#">All Api</a></li>');
    
                        // loadApp(sps[i]);
                        $("#dropdown-api li a").click(function() {
                            $("#button-api").text($(this).text());
                            $("#button-api").append('&nbsp;<span class="caret"></span>');
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
        getGadgetLocation(function(gadget_Location) {
            gadgetLocation = gadget_Location;
            $.ajax({
                url: gadgetLocation + '/gadget-controller.jag?action=remove&index=' + index,
                method: METHOD.POST,
                contentType: CONTENT_TYPE,
                async: false,
                success: function(data) {
                    $("#button-list").click();
                }
            });
        });
    }
    
    
    function downloadFile(index) {
        getGadgetLocation(function(gadget_Location) {
            gadgetLocation = gadget_Location;
            location.href = gadgetLocation + '/gadget-controller.jag?action=get&index=' + index;
    
        });
    }