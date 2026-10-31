from odoo import models, fields, api

class SaleSubscription(models.Model):
    _name = 'sale.subscription'
    _description = 'Customer Subscription'

    name = fields.Char(string='Subscription Number', required=True, copy=False, readonly=True, default='New')
