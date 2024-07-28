import { LightningElement, wire, track } from 'lwc';
import getInvoicesWithLineItems from '@salesforce/apex/InvoiceController.getInvoicesWithLineItems';
import getMoreLineItems from '@salesforce/apex/InvoiceController.getMoreLineItems';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const PAGE_SIZE = 10;

export default class InvoiceTree extends LightningElement {
    @track invoices = [];
    error;

    @wire(getInvoicesWithLineItems, { limitSize: PAGE_SIZE, offsetSize: 0 })
    wiredInvoices({ error, data }) {
        if (data) {
            //console.log(JSON.stringify(data));
            this.invoices = Object.keys(data).map(id => ({
                id,
                name: data[id][0]?.Invoice__r?.Name,
                lineItems: data[id],
                expanded: false,
                hasMore: data[id].length === PAGE_SIZE,
                offset: PAGE_SIZE
            }));
            
        } else if (error) {
            this.error = error;
            this.showToast('Error', error.body.message, 'error');
        }
    }

    toggleLineItems(event) {
        const id = event.target.dataset.id;
        this.invoices = this.invoices.map(invoice => {
            if (invoice.id === id) {
                invoice.expanded = !invoice.expanded;
            } else {
                invoice.expanded = false;
            }
            return invoice;
        });
        //console.log(JSON.stringify(this.invoices[0].lineItems));
    }

    loadMore(event) {
        const id = event.target.dataset.id;
        const invoice = this.invoices.find(inv => inv.id === id);
        
        getMoreLineItems({ invoiceId: id, limitSize: PAGE_SIZE, offsetSize: invoice.offset })
            .then(data => {
                if (data.length) {
                    invoice.lineItems = [...invoice.lineItems, ...data];
                    invoice.hasMore = data.length === PAGE_SIZE;
                    invoice.offset += PAGE_SIZE;
                } else {
                    invoice.hasMore = false;
                }
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
}
