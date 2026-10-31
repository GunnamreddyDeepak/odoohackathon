{
    'name': 'Subscription Management System',
    'version': '1.0',
    'summary': 'Manage plans, recurring billing, and subscriptions',
    'depends': ['base', 'sale', 'account'],
    'data': [
        'security/ir.model.access.csv',
    ],
    'installable': True,
    'application': True,
}
