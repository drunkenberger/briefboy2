export interface ZohoModule {
  api_name: string;
  display_label: string;
  created_time: string;
  modified_time: string;
  plural_label: string;
  presence_sub_menu: boolean;
  triggers_supported: boolean;
}

export interface ZohoUser {
  id: string;
  name: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  profile: {
    name: string;
    id: string;
  };
  role: {
    name: string;
    id: string;
  };
  status: string;
}

export interface ZohoAccount {
  id: string;
  Account_Name: string;
  Account_Number: string;
  Phone: string;
  Fax: string;
  Website: string;
  Account_Type: string;
  Industry: string;
  Annual_Revenue: number;
  SIC_Code: string;
  Ticker_Symbol: string;
  Ownership: string;
  Description: string;
  Rating: string;
  Account_Site: string;
  Employees: number;
  Billing_Street: string;
  Billing_City: string;
  Billing_State: string;
  Billing_Code: string;
  Billing_Country: string;
  Shipping_Street: string;
  Shipping_City: string;
  Shipping_State: string;
  Shipping_Code: string;
  Shipping_Country: string;
  Parent_Account: {
    name: string;
    id: string;
  };
  Account_Owner: ZohoUser;
  Created_Time: string;
  Modified_Time: string;
}

export interface ZohoDeal {
  id: string;
  Deal_Name: string;
  Account_Name: {
    name: string;
    id: string;
  };
  Stage: string;
  Amount: number;
  Probability: number;
  Expected_Revenue: number;
  Closing_Date: string;
  Deal_Owner: ZohoUser;
  Contact_Name: {
    name: string;
    id: string;
  };
  Lead_Source: string;
  Type: string;
  Next_Step: string;
  Lead_Conversion_Time: number;
  Overall_Sales_Duration: number;
  Campaign_Source: {
    name: string;
    id: string;
  };
  Description: string;
  Created_Time: string;
  Modified_Time: string;
}

export interface ZohoTask {
  id: string;
  Subject: string;
  Due_Date: string;
  Status: string;
  Priority: string;
  What_Id: {
    name: string;
    id: string;
    module: string;
  };
  Who_Id: {
    name: string;
    id: string;
    module: string;
  };
  Owner: ZohoUser;
  Description: string;
  Remind_At: string;
  Recurring_Activity: string;
  Created_Time: string;
  Modified_Time: string;
}

export interface ZohoEvent {
  id: string;
  Event_Title: string;
  Start_DateTime: string;
  End_DateTime: string;
  Location: string;
  All_day: boolean;
  What_Id: {
    name: string;
    id: string;
    module: string;
  };
  Who_Id: {
    name: string;
    id: string;
    module: string;
  };
  Owner: ZohoUser;
  Description: string;
  Remind_At: string;
  Check_In_Status: string;
  Check_In_Time: string;
  Participants: ZohoUser[];
  Recurring_Activity: string;
  Created_Time: string;
  Modified_Time: string;
}

export interface ZohoCall {
  id: string;
  Subject: string;
  Call_Type: string;
  Call_Start_Time: string;
  Call_Duration: string;
  Call_Purpose: string;
  Call_Result: string;
  What_Id: {
    name: string;
    id: string;
    module: string;
  };
  Who_Id: {
    name: string;
    id: string;
    module: string;
  };
  Owner: ZohoUser;
  Description: string;
  Reminder: string;
  Created_Time: string;
  Modified_Time: string;
}

export interface ZohoNote {
  id: string;
  Note_Title: string;
  Note_Content: string;
  Parent_Id: {
    name: string;
    id: string;
    module: string;
  };
  Owner: ZohoUser;
  Created_Time: string;
  Modified_Time: string;
}

export interface ZohoAttachment {
  id: string;
  File_Name: string;
  Size: number;
  Parent_Id: {
    name: string;
    id: string;
    module: string;
  };
  Owner: ZohoUser;
  Created_Time: string;
  Modified_Time: string;
}

export interface ZohoCampaign {
  id: string;
  Campaign_Name: string;
  Campaign_Owner: ZohoUser;
  Type: string;
  Status: string;
  Start_Date: string;
  End_Date: string;
  Expected_Revenue: number;
  Actual_Cost: number;
  Expected_Response: number;
  Num_sent: number;
  Budgeted_Cost: number;
  Parent_Campaign: {
    name: string;
    id: string;
  };
  Description: string;
  Created_Time: string;
  Modified_Time: string;
}

export interface ZohoProduct {
  id: string;
  Product_Name: string;
  Product_Code: string;
  Unit_Price: number;
  Quantity_Ordered: number;
  Quantity_in_Stock: number;
  Reorder_Level: number;
  Product_Category: string;
  Description: string;
  Product_Active: boolean;
  Commission_Rate: number;
  Tax: string[];
  Vendor_Name: {
    name: string;
    id: string;
  };
  Manufacturer: string;
  Support_Start_Date: string;
  Support_Expiry_Date: string;
  Created_Time: string;
  Modified_Time: string;
}

export interface ZohoQuote {
  id: string;
  Subject: string;
  Quote_Stage: string;
  Valid_Till: string;
  Contact_Name: {
    name: string;
    id: string;
  };
  Account_Name: {
    name: string;
    id: string;
  };
  Deal_Name: {
    name: string;
    id: string;
  };
  Quote_Owner: ZohoUser;
  Billing_Street: string;
  Billing_City: string;
  Billing_State: string;
  Billing_Code: string;
  Billing_Country: string;
  Shipping_Street: string;
  Shipping_City: string;
  Shipping_State: string;
  Shipping_Code: string;
  Shipping_Country: string;
  Description: string;
  Sub_Total: number;
  Discount: number;
  Tax: number;
  Grand_Total: number;
  Terms_and_Conditions: string;
  Created_Time: string;
  Modified_Time: string;
}

export interface ZohoSalesOrder {
  id: string;
  Subject: string;
  Customer_No: string;
  Purchase_Order: string;
  Due_Date: string;
  Pending: string;
  Carrier: string;
  Status: string;
  Sales_Commission: number;
  Contact_Name: {
    name: string;
    id: string;
  };
  Account_Name: {
    name: string;
    id: string;
  };
  Deal_Name: {
    name: string;
    id: string;
  };
  Quote_Name: {
    name: string;
    id: string;
  };
  Owner: ZohoUser;
  Billing_Street: string;
  Billing_City: string;
  Billing_State: string;
  Billing_Code: string;
  Billing_Country: string;
  Shipping_Street: string;
  Shipping_City: string;
  Shipping_State: string;
  Shipping_Code: string;
  Shipping_Country: string;
  Description: string;
  Sub_Total: number;
  Discount: number;
  Tax: number;
  Adjustment: number;
  Grand_Total: number;
  Terms_and_Conditions: string;
  Created_Time: string;
  Modified_Time: string;
}

export interface ZohoInvoice {
  id: string;
  Subject: string;
  Invoice_Date: string;
  Due_Date: string;
  Status: string;
  Invoice_Number: string;
  Purchase_Order: string;
  Excise_Duty: number;
  Sales_Commission: number;
  Contact_Name: {
    name: string;
    id: string;
  };
  Account_Name: {
    name: string;
    id: string;
  };
  Sales_Order: {
    name: string;
    id: string;
  };
  Owner: ZohoUser;
  Billing_Street: string;
  Billing_City: string;
  Billing_State: string;
  Billing_Code: string;
  Billing_Country: string;
  Shipping_Street: string;
  Shipping_City: string;
  Shipping_State: string;
  Shipping_Code: string;
  Shipping_Country: string;
  Description: string;
  Sub_Total: number;
  Discount: number;
  Tax: number;
  Adjustment: number;
  Grand_Total: number;
  Terms_and_Conditions: string;
  Created_Time: string;
  Modified_Time: string;
}

export interface ZohoPriceBook {
  id: string;
  Price_Book_Name: string;
  Pricing_Details: {
    from_range: number;
    to_range: number;
    discount: number;
  }[];
  Pricing_Model: string;
  Description: string;
  Product_Name: {
    name: string;
    id: string;
  };
  Active: boolean;
  Created_Time: string;
  Modified_Time: string;
}

export interface ZohoPurchaseOrder {
  id: string;
  Subject: string;
  PO_Date: string;
  Due_Date: string;
  Vendor_Name: {
    name: string;
    id: string;
  };
  Tracking_Number: string;
  Contact_Name: {
    name: string;
    id: string;
  };
  Requisition_No: string;
  Status: string;
  Carrier: string;
  Excise_Duty: number;
  Owner: ZohoUser;
  Billing_Street: string;
  Billing_City: string;
  Billing_State: string;
  Billing_Code: string;
  Billing_Country: string;
  Shipping_Street: string;
  Shipping_City: string;
  Shipping_State: string;
  Shipping_Code: string;
  Shipping_Country: string;
  Description: string;
  Sub_Total: number;
  Discount: number;
  Tax: number;
  Adjustment: number;
  Grand_Total: number;
  Terms_and_Conditions: string;
  Created_Time: string;
  Modified_Time: string;
}

export interface ZohoVendor {
  id: string;
  Vendor_Name: string;
  Email: string;
  Phone: string;
  Website: string;
  Category: string;
  GL_Account: string;
  Description: string;
  Mailing_Street: string;
  Mailing_City: string;
  Mailing_State: string;
  Mailing_Zip: string;
  Mailing_Country: string;
  Owner: ZohoUser;
  Created_Time: string;
  Modified_Time: string;
}

export type ZohoRecordType = 
  | ZohoAccount
  | ZohoDeal
  | ZohoTask
  | ZohoEvent
  | ZohoCall
  | ZohoNote
  | ZohoAttachment
  | ZohoCampaign
  | ZohoProduct
  | ZohoQuote
  | ZohoSalesOrder
  | ZohoInvoice
  | ZohoPriceBook
  | ZohoPurchaseOrder
  | ZohoVendor;