public with sharing class InvoiceController {
    @AuraEnabled(cacheable=true)
    public static Map<Id, List<Invoice_Line_Item__c>> getInvoicesWithLineItems(Integer limitSize, Integer offsetSize) {
        try {
            Map<Id, List<Invoice_Line_Item__c>> resultMap = new Map<Id, List<Invoice_Line_Item__c>>();
            List<Invoice__c> invoices = [SELECT Id, Name FROM Invoice__c];
            
            for (Invoice__c invoice : invoices) {
                List<Invoice_Line_Item__c> lineItems = [
                    SELECT Id, Name, Invoice__c,Invoice__r.Name 
                    FROM Invoice_Line_Item__c 
                    WHERE Invoice__c = :invoice.Id
                    LIMIT :limitSize
                    OFFSET :offsetSize
                ];
                resultMap.put(invoice.Id, lineItems);
            }

            return resultMap;
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching invoice data: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Invoice_Line_Item__c> getMoreLineItems(Id invoiceId, Integer limitSize, Integer offsetSize) {
        try {
            return [
                SELECT Id, Name, Invoice__c,Invoice__r.Name 
                FROM Invoice_Line_Item__c 
                WHERE Invoice__c = :invoiceId
                LIMIT :limitSize
                OFFSET :offsetSize
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching more line items: ' + e.getMessage());
        }
    }
}