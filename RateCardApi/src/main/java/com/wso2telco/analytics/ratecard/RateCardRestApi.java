package com.wso2telco.analytics.ratecard;

import com.google.gson.Gson;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2telco.analytics.pricing.service.ChargeRate;
import org.wso2telco.analytics.pricing.service.RateCardService;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

/*******************************************************************************
 * Copyright (c) 2015-2017, WSO2.Telco Inc. (http://www.wso2telco.com)
 *
 * All Rights Reserved. WSO2.Telco Inc. licences this file to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
@Path("/ratecardapi")
@Produces({MediaType.APPLICATION_JSON})
public class RateCardRestApi {

    private static Log log = LogFactory.getLog(RateCardRestApi.class);
    public static final String NB_DIRECTION = "northbound";
    public static final String SB_DIRECTION = "southbound";

    @GET
    @Path("/{direction}")
    public Response getRateCard(@PathParam("direction") String directions,@QueryParam("operationId") String operationId, @QueryParam("applicationId") String applicationId,
                                @QueryParam("api") String api, @QueryParam("category") String category, @QueryParam("subCategory") String subCategory, @QueryParam("operator") String operator, @QueryParam("operation") String operation)
    {
        RateCardService rateCardObject = new RateCardService();
        Gson gson = new Gson();
        String jsonResponse = "";
        ChargeRate chargeRateObj = null;
        if(directions == null)
        {
            return Response.status(Response.Status.NO_CONTENT)
                    .entity("Please enter your direction")
                    .build();
        }
        if(directions.equalsIgnoreCase(NB_DIRECTION)) {
            try {
                if(operationId == null || operationId.isEmpty())
                {

                    return  Response.status(Response.Status.NO_CONTENT)
                            .entity("Please enter your operationId")
                            .build();
                }
                else if(applicationId==null|| applicationId.isEmpty())
                {
                    return  Response.status(Response.Status.NO_CONTENT)
                            .entity("Please enter your applicationId")
                            .build();
                }
                else if(api==null||api.isEmpty())
                {
                    return  Response.status(Response.Status.NO_CONTENT)
                            .entity("Please enter your API Name")
                            .build();
                }
                else if(category==null|| category.isEmpty())
                {
                    return  Response.status(Response.Status.NO_CONTENT)
                            .entity("Please enter your Category")
                            .build();
                }
                else if(subCategory==null || subCategory.isEmpty())
                {
                    return  Response.status(Response.Status.NO_CONTENT)
                            .entity("Please enter your SubCategory")
                            .build();
                }
                else {
                    chargeRateObj = (ChargeRate) rateCardObject.getNBRateCard(operationId, applicationId, api, category,
                            subCategory);
                    if(chargeRateObj == null)
                    {
                        return  Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                                .entity("Please enter correct Query param values")
                                .build();
                    }
                }
            } catch (Exception e) {
                log.error("Couldn't get the NorthBound RateCard Details"+e.getMessage());
                return  Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                        .entity("Please enter correct Query param values")
                        .build();
            }
        }
        if(directions.equalsIgnoreCase(SB_DIRECTION))
        {
            try {
                if(operator == null ||operator.isEmpty())
                {
                    return  Response.status(Response.Status.NO_CONTENT)
                            .entity("Please enter your Operator Name")
                            .build();
                }
                else if(operation == null||operation.isEmpty())
                {
                    return  Response.status(Response.Status.NO_CONTENT)
                            .entity("Please enter your Operation")
                            .build();
                }
                else if(applicationId==null|| applicationId.isEmpty())
                {
                    return  Response.status(Response.Status.NO_CONTENT)
                            .entity("Please enter your applicationId")
                            .build();
                }
                else if(category==null|| category.isEmpty())
                {
                    return  Response.status(Response.Status.NO_CONTENT)
                            .entity("Please enter your Category")
                            .build();
                }
                else if(subCategory==null || subCategory.isEmpty())
                {
                    return  Response.status(Response.Status.NO_CONTENT)
                            .entity("Please enter your SubCategory")
                            .build();
                }
                else
                {
                    chargeRateObj = (ChargeRate)rateCardObject.getSBRateCard(operator,operation,applicationId,category,
                            subCategory);
                    if(chargeRateObj == null)
                    {
                        return  Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                                .entity("Please enter correct Query param values")
                                .build();
                    }
                }
            } catch (Exception e) {
                log.error("Couldn't get the SouthBound RateCard Details"+e.getMessage());
                return  Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                        .entity("Please enter correct Query param values")
                        .build();
            }
        }
        try {
            jsonResponse = gson.toJson(chargeRateObj);
            if(jsonResponse == null || jsonResponse == "") {
                return  Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                        .entity("Please enter correct Query param values")
                        .build();

            }
            else
            {
                return Response.status(200).entity(jsonResponse).build();
            }
        }
        catch (Exception ex)
        {
            return Response.status(Response.Status.BAD_REQUEST).entity("Please enter correct Query param values").build();
        }
    }
}