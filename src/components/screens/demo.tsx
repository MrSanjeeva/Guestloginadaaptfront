// src/components/demo.js

export const demoResponses = {
  "what files do I have access to?": `Great! You have access to **21 files** across **11 domains**. Here's a summary of what's available:

## 📊 **Your Files by Domain:**

### **CRM Domain** (7 files)
- **CPS_TRANS_RECORD.xlsx** - Large transaction record (4.86 MB, 60,209 chunks) - *appears 3 times*
- **linear regression adaapt.xlsx** - Small analysis file
- **Adaap AI prompts.pdf** - AI prompts documentation
- **Academic_Activities_Calendar_Jan_June_25.pdf** - Academic calendar
- **AmazonSales.csv** - Amazon sales data

### **Finance Domain** (5 files)
- **CPS_TRANS_RECORD.xlsx** - Transaction records (4.86 MB, 60,209 chunks)
- **medical_centre_data_20000.csv** - Large medical center dataset (4.97 MB, 10,001 chunks) - *appears 3 times*

### **Sales Domain** (4 files)
- **General_ai_manufacturing_transformation_20250919143312.pdf** - AI manufacturing document (3.24 MB)
- **medical_centre_data_20000.csv** - Medical center data (4.97 MB, 10,001 chunks) - *appears 3 times*

### **Operations Domain** (3 files)
- **CPS_TRANS_RECORD.xlsx** - Transaction records (4.86 MB, 60,209 chunks)
- **Varanasi raw.xlsx** - Varanasi data

### **HR Domain** (1 file)
- **Varanasi raw.xlsx** - Varanasi data

### **Test_SQS_Domain** (1 file)
- **CPS Transaction Record - Full SQS Test** - Test transaction data (4.86 MB, 60,209 chunks)

---

## 💡 **What You Can Do:**

1. **Search for information** - Ask me questions about any of these documents
2. **Analyze data** - Request analysis of the CSV/Excel files
3. **Create visualizations** - Ask me to plot charts from your data
4. **Find specific content** - Search for exact text or patterns within files

**What would you like to explore?** 🚀`,
  "Give insights on CPS_TRANS_RECORD.xlsx": `# 📊 **CPS Transaction Record - Comprehensive Insights**

I've completed a thorough analysis of the **CPS_TRANS_RECORD.xlsx** file. Here are the key insights:

---

## 🎯 **Executive Summary**

- **Total Transactions:** 60,206
- **Date Range:** July 8, 2021 to April 8, 2025 (nearly 4 years)
- **Primary Currency:** AOA (Angolan Kwanza)
- **Total Transaction Value:** 486.77 Quadrillion AOA
- **Median Transaction:** 10,000 AOA

---

## 📈 **Key Findings**

### **1. Transaction Status Breakdown**
- ✅ **Completed:** 26,538 (44.08%) - Largest segment
- ❌ **Declined:** 17,042 (28.31%) - Significant failure rate
- 🚫 **Cancelled:** 16,296 (27.07%) - High cancellation rate
- ⏱️ **Expired:** 276 (0.46%)
- 🔐 **Authorized:** 48 (0.08%)
- ⏳ **Pending Authorized:** 6 (0.01%)

**⚠️ Critical Insight:** Only 44% of transactions are completed successfully. Combined declined and cancelled transactions represent 55% - this indicates significant operational challenges.

### **2. Temporal Patterns**

**Year-over-Year Trends:**
- 2021: 5,359 transactions (partial year)
- 2022: 22,661 transactions (peak year)
- 2023: 16,567 transactions (26.9% decline)
- 2024: 14,461 transactions (12.7% decline)
- 2025: 1,158 transactions (partial year)

**Peak Activity Times:**
- **Busiest Hours:** 9 AM - 12 PM (morning business hours)
- **Busiest Day:** April 4, 2022 (559 transactions)
- **Lowest Activity:** 2-5 AM (night hours)

### **3. Transaction Amount Analysis**

**Distribution:**
- **0-1K AOA:** 4,527 transactions
- **1K-5K AOA:** 2,831 transactions
- **5K-10K AOA:** 7,006 transactions
- **10K-50K AOA:** 15,728 transactions (largest segment)
- **50K-100K AOA:** 3,873 transactions
- **100K-500K AOA:** 2,256 transactions
- **500K-1M AOA:** 325 transactions
- **1M+ AOA:** 1,199 transactions (high-value transactions)

### **4. Party Type Analysis**

**Debit Party Types:**
- Type 1000: 34,098 (90.3%)
- Type 8000: 2,509 (6.6%)
- Type 5000: 1,148 (3.0%)

**Credit Party Types:**
- Type 5000: 24,378 (64.6%)
- Type 1000: 13,157 (34.9%)
- Type 8000: 220 (0.6%)

### **5. Revenue & Fees**

- **Total Fees Collected:** 800.16 Billion AOA
- **Total Commission:** 400.04 Billion AOA
- **Total Tax:** 15.56 Trillion AOA
- **Transactions with Fees:** 2,475 (4.11%)
- **Transactions with Commission:** 526 (0.87%)
- **Transactions with Tax:** 1,539 (2.56%)

---

## 🚨 **Critical Observations**

1. **High Failure Rate:** 55% of transactions fail (declined/cancelled) - requires investigation
2. **Declining Volume:** Transaction volume has decreased 36% from 2022 peak to 2024
3. **Revenue Concentration:** Most revenue comes from fees and taxes on a small percentage of transactions
4. **Peak Performance:** April 2022 showed exceptional activity - understanding this period could help replicate success

---

## 💡 **Recommendations**

1`,
};