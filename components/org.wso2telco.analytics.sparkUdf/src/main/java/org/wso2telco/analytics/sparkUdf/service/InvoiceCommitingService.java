package org.wso2telco.analytics.sparkUdf.service;

import java.util.List;
import java.util.UUID;

import org.killbill.billing.client.KillBillClient;
import org.killbill.billing.client.KillBillClientException;
import org.killbill.billing.client.KillBillHttpClient;
import org.killbill.billing.client.RequestOptions;
import org.killbill.billing.client.model.Invoice;
import org.killbill.billing.invoice.api.InvoiceStatus;
import org.wso2telco.analytics.sparkUdf.configProviders.ConfigurationDataProvider;

public class InvoiceCommitingService {

	private static ConfigurationDataProvider dataProvider=null;
	private static KillBillHttpClient killBillHttpClient;
	private static KillBillClient killBillClient;

	public String commitAllInvoice(String  accountID) throws KillBillClientException {


		ConfigurationDataProvider dataProvider=ConfigurationDataProvider.getInstance();

		killBillHttpClient= new KillBillHttpClient(dataProvider.getUrl(),
				dataProvider.getUname(),
				dataProvider.getPassword(),
				dataProvider.getApiKey(),
				dataProvider.getApiSecret());
		killBillClient = new KillBillClient(killBillHttpClient);
		RequestOptions requestOptionsForBillUpdate = RequestOptions.builder()
				.withCreatedBy("admin")
				.withReason("payment")
				.withComment("payment")
				.build();
		List<Invoice> invoices=killBillClient.getInvoicesForAccount(UUID.fromString(accountID));
		if(invoices!=null && invoices.size()!=0){
			for(Invoice invoice:invoices){
				if(invoice.getStatus()!=InvoiceStatus.COMMITTED.toString()){
					killBillClient.commitInvoice(invoice.getInvoiceId(), requestOptionsForBillUpdate);
				}
			}
		}


		return "ok"; 
	}

}