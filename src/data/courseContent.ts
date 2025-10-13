export interface Topic {
  title: string;
  content: string;
}

export const courseContent: Record<string, Topic[]> = {
  "Accounting Basics": [
    {
      title: "Topic 1: Introduction to Accounting",
      content: `**What is Accounting?**

Accounting is the systematic recording, reporting, and analysis of financial transactions of a business. It helps track income, expenses, assets, and liabilities.

**Purpose of Accounting:**
- Recording all business transactions
- Preparing financial statements
- Helping in decision-making
- Ensuring compliance with laws
- Providing information to stakeholders

**Who Uses Accounting?**
- Business owners and managers
- Investors and shareholders
- Tax authorities
- Creditors and lenders
- Government agencies

**Types of Accounting:**

**1. Financial Accounting:**
- External reporting
- Following standards (GAAP, IFRS)
- Annual financial statements

**2. Management Accounting:**
- Internal use
- Planning and budgeting
- Performance analysis

**3. Tax Accounting:**
- Tax return preparation
- Tax planning
- Compliance with tax laws

**Importance:**
Accounting is essential for understanding the financial health of a business and making informed decisions.`
    },
    {
      title: "Topic 2: Double-Entry Bookkeeping",
      content: `**Double-Entry System**

Every transaction affects at least two accounts - one account is debited and another is credited. This ensures the accounting equation remains balanced.

**Accounting Equation:**
Assets = Liabilities + Equity

**Debit and Credit Rules:**

**Assets:**
- Debit increases
- Credit decreases

**Liabilities:**
- Debit decreases
- Credit increases

**Equity:**
- Debit decreases
- Credit increases

**Revenue:**
- Debit decreases
- Credit increases

**Expenses:**
- Debit increases
- Credit decreases

**Example Transaction:**
Company purchases equipment for $5,000 cash.
- Debit: Equipment $5,000
- Credit: Cash $5,000

**Benefits of Double-Entry:**
- Accuracy through balance checking
- Complete record of transactions
- Detection of errors
- Preparation of financial statements

**Journal Entries:**
All transactions are first recorded in the journal with:
- Date
- Accounts affected
- Debit and credit amounts
- Brief description`
    },
    {
      title: "Topic 3: Financial Statements",
      content: `**Main Financial Statements**

**1. Balance Sheet:**
Shows financial position at a specific date.

**Components:**
- Assets (what the company owns)
- Liabilities (what the company owes)
- Equity (owner's investment)

**2. Income Statement:**
Shows profitability over a period.

**Components:**
- Revenue (sales, fees earned)
- Expenses (costs of doing business)
- Net Income (profit or loss)

**3. Cash Flow Statement:**
Shows cash inflows and outflows.

**Categories:**
- Operating activities
- Investing activities
- Financing activities

**4. Statement of Changes in Equity:**
Shows changes in owner's equity.

**Reading Financial Statements:**

**Liquidity Analysis:**
- Current ratio
- Quick ratio
- Cash ratio

**Profitability Analysis:**
- Gross profit margin
- Net profit margin
- Return on assets

**Importance:**
Financial statements provide crucial information for investors, creditors, and management to assess company performance.`
    },
    {
      title: "Topic 4: Accounts and Ledgers",
      content: `**Chart of Accounts**

A systematic listing of all accounts used by a business.

**Categories:**

**1. Assets:**
- Current assets (cash, receivables)
- Fixed assets (property, equipment)
- Intangible assets (patents, goodwill)

**2. Liabilities:**
- Current liabilities (payables, short-term debt)
- Long-term liabilities (loans, bonds)

**3. Equity:**
- Capital
- Retained earnings
- Drawings

**4. Revenue:**
- Sales revenue
- Service revenue
- Other income

**5. Expenses:**
- Cost of goods sold
- Operating expenses
- Interest expense

**General Ledger:**

The master record of all accounts.

**Process:**
1. Transactions recorded in journal
2. Posted to general ledger
3. Trial balance prepared
4. Financial statements created

**Account Format:**
- T-account format
- Running balance format

**Posting:**
Transferring journal entries to ledger accounts.`
    },
    {
      title: "Topic 5: Revenue and Expense Recognition",
      content: `**Accrual Accounting**

Revenue is recognized when earned, not when cash is received. Expenses are recognized when incurred, not when paid.

**Revenue Recognition Principles:**

**1. When to Recognize:**
- Performance obligation satisfied
- Goods delivered or services performed
- Amount can be measured reliably

**2. Examples:**
- Sale on credit: recognize immediately
- Advance payment: recognize when earned
- Long-term contracts: recognize progressively

**Expense Matching Principle:**

Match expenses with related revenues in the same period.

**Types of Expenses:**

**1. Direct Expenses:**
- Cost of goods sold
- Direct labor
- Direct materials

**2. Indirect Expenses:**
- Rent
- Utilities
- Salaries
- Depreciation

**Adjusting Entries:**

**Prepaid Expenses:**
- Insurance paid in advance
- Prepaid rent

**Accrued Expenses:**
- Salaries payable
- Interest payable

**Unearned Revenue:**
- Advance payments received
- Deferred revenue

**Accrued Revenue:**
- Services performed but not billed
- Interest receivable`
    },
    {
      title: "Topic 6: Inventory Accounting",
      content: `**Inventory Valuation Methods**

**1. FIFO (First-In, First-Out):**
- Oldest items sold first
- Ending inventory at recent costs
- Higher profits in rising prices

**2. LIFO (Last-In, First-Out):**
- Newest items sold first
- Ending inventory at older costs
- Lower profits in rising prices
- Not allowed under IFRS

**3. Weighted Average:**
- Average cost of all units
- Smooths price fluctuations
- Simple to calculate

**Inventory Systems:**

**Periodic System:**
- Count inventory periodically
- Calculate COGS at period end
- Simpler for small businesses

**Perpetual System:**
- Continuous tracking
- Real-time inventory records
- Better control and accuracy

**Cost Components:**

**Purchase Cost:**
- Invoice price
- Transportation costs
- Import duties
- Less: trade discounts

**Lower of Cost or Market:**
Write down inventory if market value falls below cost.

**Inventory Turnover:**
= Cost of Goods Sold / Average Inventory
Measures how quickly inventory is sold.`
    },
    {
      title: "Topic 7: Depreciation",
      content: `**What is Depreciation?**

Systematic allocation of an asset's cost over its useful life.

**Factors:**
- Cost of asset
- Estimated useful life
- Estimated salvage value

**Depreciation Methods:**

**1. Straight-Line Method:**
Annual Depreciation = (Cost - Salvage Value) / Useful Life

**Example:**
- Cost: $10,000
- Salvage: $1,000
- Life: 5 years
- Annual depreciation: $1,800

**2. Declining Balance Method:**
Higher depreciation in early years.

**Formula:**
Depreciation = Book Value × Depreciation Rate

**3. Units of Production:**
Based on actual usage.

**Formula:**
Depreciation per unit = (Cost - Salvage) / Total units
Annual depreciation = Units produced × Rate

**Recording Depreciation:**

**Journal Entry:**
- Debit: Depreciation Expense
- Credit: Accumulated Depreciation

**Balance Sheet Presentation:**
Equipment $10,000
Less: Accumulated Depreciation ($3,600)
Net Book Value $6,400

**Impact:**
- Reduces net income
- Does not affect cash
- Reduces asset value
- Tax deductible`
    },
    {
      title: "Topic 8: Bank Reconciliation",
      content: `**Purpose of Bank Reconciliation**

Matching the bank statement balance with the cash book balance.

**Reasons for Differences:**

**1. Timing Differences:**
- Outstanding checks
- Deposits in transit
- Bank charges not recorded
- Interest earned not recorded

**2. Errors:**
- Recording errors in books
- Bank errors

**Reconciliation Process:**

**Step 1: Start with Bank Balance**
Add: Deposits in transit
Less: Outstanding checks
= Adjusted Bank Balance

**Step 2: Start with Book Balance**
Add: Bank credits not recorded
Less: Bank charges not recorded
= Adjusted Book Balance

**Both should match!**

**Common Items:**

**Bank Side:**
- Outstanding checks
- Deposits not yet credited

**Book Side:**
- NSF (bounced) checks
- Bank service charges
- Direct deposits
- Electronic transfers
- Interest earned

**Adjusting Entries:**
Make journal entries for items affecting book balance.

**Example Entry:**
Debit: Cash $50 (interest earned)
Credit: Interest Income $50

**Importance:**
- Ensures accuracy
- Detects errors and fraud
- Proper cash management`
    },
    {
      title: "Topic 9: Payroll Accounting",
      content: `**Payroll Components**

**Gross Pay:**
Total earnings before deductions.

**Types:**
- Hourly wages
- Salaries
- Overtime
- Bonuses
- Commissions

**Deductions:**

**1. Mandatory:**
- Income tax withholding
- Social security tax
- Medicare tax
- State taxes

**2. Voluntary:**
- Health insurance
- Retirement contributions
- Life insurance
- Union dues

**Net Pay:**
Gross pay minus all deductions.

**Employer Payroll Taxes:**

**Additional Costs:**
- Employer portion of social security
- Employer portion of Medicare
- Unemployment taxes
- Workers' compensation

**Recording Payroll:**

**Employee Compensation:**
Debit: Salaries Expense
Credit: Salaries Payable
Credit: Various tax withholdings

**Employer Taxes:**
Debit: Payroll Tax Expense
Credit: Various tax payables

**Payment:**
Debit: Salaries Payable
Credit: Cash

**Payroll Records:**
- Employee earnings record
- Payroll register
- Tax forms (W-2, 1099)

**Compliance:**
- Timely tax deposits
- Quarterly reports
- Annual filings
- Record retention`
    },
    {
      title: "Topic 10: Financial Analysis and Ratios",
      content: `**Financial Ratio Analysis**

**Liquidity Ratios:**

**1. Current Ratio:**
= Current Assets / Current Liabilities
Measures ability to pay short-term obligations.
Good ratio: 2:1 or higher

**2. Quick Ratio (Acid Test):**
= (Current Assets - Inventory) / Current Liabilities
More conservative measure.
Good ratio: 1:1 or higher

**Profitability Ratios:**

**1. Gross Profit Margin:**
= (Gross Profit / Sales) × 100
Shows pricing power and efficiency.

**2. Net Profit Margin:**
= (Net Income / Sales) × 100
Overall profitability measure.

**3. Return on Assets (ROA):**
= Net Income / Total Assets
How efficiently assets generate profit.

**4. Return on Equity (ROE):**
= Net Income / Shareholders' Equity
Return to investors.

**Efficiency Ratios:**

**1. Inventory Turnover:**
= Cost of Goods Sold / Average Inventory
How fast inventory sells.

**2. Accounts Receivable Turnover:**
= Net Credit Sales / Average Accounts Receivable
Collection efficiency.

**Leverage Ratios:**

**1. Debt-to-Equity:**
= Total Debt / Total Equity
Financial leverage measure.

**2. Debt Ratio:**
= Total Debt / Total Assets
Proportion of assets financed by debt.

**Interpretation:**
- Compare with industry averages
- Track trends over time
- Consider company's business model
- Look at ratios in combination`
    }
  ],

  "PHP": [
    {
      title: "Topic 1: Introduction to PHP - What is PHP?",
      content: `**What is PHP?**

PHP (Hypertext Preprocessor) is an open source scripting language used primarily on the server side for creating dynamic web content and web applications.

**PHP History:**
- Created in 1994
- Author: Rasmus Lerdorf
- Originally "Personal Home Page Tools"
- Today one of the most widely used web languages

**Basic Characteristics:**

**1. Server-side Language:**
- PHP code is processed on the server
- Not in the user's browser
- Result is sent as HTML

**2. Open Source:**
- Free programming language
- Open source code
- Active developer community

**3. Dynamic Content:**
- Allows changing website content
- Responds to user actions
- Customized experience instead of static pages

**Practical Significance:**
PHP allows websites to respond to user actions, creating an interactive and customized experience instead of static pages.`
    },
    {
      title: "Topic 2: Server Processing and Advantages",
      content: `**PHP Server Processing**

PHP code is executed on the web server and the result is sent to the user's browser as standard HTML.

**How it Works:**

**1. Processing Flow:**
- User requests a page
- Server processes PHP code
- Generates HTML
- Sends to browser

**2. Security:**
- User doesn't see PHP source code
- Protection of application logic
- Safer than client-side scripts

**3. Performance:**
- Processing on powerful servers
- Independent of user's device
- Efficient resource usage

**Server Processing Advantages:**

**1. Compatibility:**
- Works on all browsers
- Independent of client device
- Consistent results

**2. Data Access:**
- Direct database access
- File manipulation on server
- Processing sensitive information

**3. Flexibility:**
- Ability to integrate various services
- Working with external APIs
- Complex applications`
    },
    {
      title: "Topic 3: Dynamic Content and Interactivity",
      content: `**Creating Dynamic Content**

PHP allows changing website content based on user login, preferences, or other conditions.

**Examples of Dynamic Content:**

**1. User Customization:**
\`\`\`php
<?php
session_start();
if (isset($_SESSION['username'])) {
    echo "Welcome back, " . $_SESSION['username'];
} else {
    echo "Welcome, visitor!";
}
?>
\`\`\`

**2. Time-based Display:**
\`\`\`php
<?php
$hour = date("H");
if ($hour < 12) {
    echo "Good morning!";
} elseif ($hour < 18) {
    echo "Good afternoon!";
} else {
    echo "Good evening!";
}
?>
\`\`\`

**3. Personalized Content:**
- Product recommendations
- User preferences
- Browsing history
- Customized dashboards

**Interactive Features:**

**1. Forms:**
- Input processing
- Data validation
- Database storage

**2. User Accounts:**
- Registration
- Login
- Profile management

**3. Comments and Ratings:**
- Adding comments
- Rating system
- Feedback`
    },
    {
      title: "Topic 4: Open Source Properties and Community",
      content: `**PHP as Open Source Project**

PHP is a free programming language with open source code that has a huge developer community.

**Open Source Advantages:**

**1. Free:**
- No licensing fees
- Free use for any project
- No restrictions

**2. Transparency:**
- Open source code
- Security audit capability
- Trustworthiness

**3. Flexibility:**
- Ability to modify as needed
- Contributing to the project
- Creating custom extensions

**PHP Community:**

**1. Extensive Resources:**
- Millions of developers worldwide
- Huge amount of documentation
- Forums and discussions
- Online tutorials

**2. Libraries and Frameworks:**
- Laravel
- Symfony
- CodeIgniter
- Zend Framework
- CakePHP

**3. Support:**
- Stack Overflow
- PHP official documentation
- GitHub repositories
- Active blogs and articles

**Language Evolution:**

**Regular Updates:**
- New versions with improvements
- Security fixes
- New features
- Better performance

**Modern PHP:**
- PHP 8.x with JIT compiler
- Improved syntax
- Better performance
- Modern programming concepts`
    },
    {
      title: "Topic 5: Compatibility and Versatility",
      content: `**PHP Multiplatform Support**

PHP can be used on various operating systems and works with different databases.

**Supported Operating Systems:**

**1. Windows:**
- PHP on IIS server
- Apache for Windows
- XAMPP package

**2. Mac OS:**
- Pre-installed in macOS
- MAMP package
- Easy installation

**3. Linux:**
- Most commonly used platform
- LAMP stack
- Optimal performance

**Database Support:**

**1. MySQL/MariaDB:**
\`\`\`php
<?php
$conn = mysqli_connect("localhost", "user", "pass", "db");
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
?>
\`\`\`

**2. PostgreSQL:**
- Advanced database
- Support for complex data
- High performance

**3. SQLite:**
- Lightweight database
- Serverless
- Suitable for smaller projects

**4. Other Databases:**
- Oracle
- Microsoft SQL Server
- MongoDB (via extension)

**Web Servers:**

**1. Apache:**
- Most widely used
- .htaccess support
- Modular architecture

**2. Nginx:**
- High performance
- Modern alternative
- Efficient processing

**Versatility of Use:**

**Beyond Web Applications:**
- CLI applications
- Task automation
- API servers
- Microservices`
    },
    {
      title: "Topic 6: Basic Syntax and PHP Structure",
      content: `**PHP Syntax Basics**

Every PHP code starts with <?php tag and ends with ?>

**Basic Structure:**

\`\`\`php
<?php
// This is a comment

/* Multi-line
   comment */

echo "Hello, World!";
?>
\`\`\`

**PHP in HTML:**

\`\`\`php
<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1><?php echo "Welcome to PHP"; ?></h1>
    <p>Current time: <?php echo date("H:i:s"); ?></p>
</body>
</html>
\`\`\`

**Text Output:**

**1. Echo:**
\`\`\`php
<?php
echo "Text";
echo "Multiple ", "parameters";
?>
\`\`\`

**2. Print:**
\`\`\`php
<?php
print "Text";
?>
\`\`\`

**Variables:**

**Basics:**
\`\`\`php
<?php
$name = "Peter";
$age = 25;
$height = 180.5;
$isStudent = true;

echo "Name: $name, Age: $age";
?>
\`\`\`

**Variable Rules:**
- Start with $ sign
- First character must be letter or _
- Case-sensitive ($Name ≠ $name)
- Can contain letters, numbers, _

**Data Types:**

**1. String:**
\`\`\`php
$text = "Hello";
$text2 = 'World';
?>
\`\`\`

**2. Integer:**
\`\`\`php
$number = 123;
?>
\`\`\`

**3. Float:**
\`\`\`php
$decimal = 12.5;
?>
\`\`\`

**4. Boolean:**
\`\`\`php
$true = true;
?>
\`\`\`

**5. Array:**
\`\`\`php
$array = array(1, 2, 3);
$array2 = [4, 5, 6];
?>
\`\`\``
    },
    {
      title: "Topic 7: Working with Forms and HTTP",
      content: `**Form Processing in PHP**

PHP allows easy form processing using superglobal variables.

**GET Method:**

**HTML Form:**
\`\`\`html
<form method="GET" action="process.php">
    <input type="text" name="name">
    <input type="submit" value="Submit">
</form>
\`\`\`

**Processing:**
\`\`\`php
<?php
if (isset($_GET['name'])) {
    $name = $_GET['name'];
    echo "Your name is: " . htmlspecialchars($name);
}
?>
\`\`\`

**POST Method:**

**HTML Form:**
\`\`\`html
<form method="POST" action="process.php">
    <input type="email" name="email">
    <input type="password" name="password">
    <input type="submit" value="Login">
</form>
\`\`\`

**Processing:**
\`\`\`php
<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];
    $password = $_POST['password'];
    
    // Validation
    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo "Email is valid";
    }
}
?>
\`\`\`

**Input Validation:**

**1. Check Empty Fields:**
\`\`\`php
<?php
if (empty($_POST['name'])) {
    echo "Name is required";
}
?>
\`\`\`

**2. Sanitization:**
\`\`\`php
<?php
$name = htmlspecialchars($_POST['name']);
$email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
?>
\`\`\`

**File Upload:**

**HTML:**
\`\`\`html
<form method="POST" enctype="multipart/form-data">
    <input type="file" name="file">
    <input type="submit" value="Upload">
</form>
\`\`\`

**PHP:**
\`\`\`php
<?php
if (isset($_FILES['file'])) {
    $name = $_FILES['file']['name'];
    $tmp = $_FILES['file']['tmp_name'];
    move_uploaded_file($tmp, "uploads/" . $name);
}
?>
\`\`\``
    },
    {
      title: "Topic 8: MySQL Database Connection",
      content: `**Working with MySQL Database**

PHP provides several ways to connect and work with MySQL database.

**MySQLi - Object Oriented:**

**1. Connection:**
\`\`\`php
<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "myDB";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully";
?>
\`\`\`

**2. SELECT Query:**
\`\`\`php
<?php
$sql = "SELECT id, name, email FROM users";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        echo "id: " . $row["id"] . " - Name: " . $row["name"];
    }
} else {
    echo "0 results";
}
$conn->close();
?>
\`\`\`

**3. INSERT Query:**
\`\`\`php
<?php
$sql = "INSERT INTO users (name, email) VALUES ('John', 'john@example.com')";

if ($conn->query($sql) === TRUE) {
    echo "New record created successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}
?>
\`\`\`

**Prepared Statements:**

**Security:**
\`\`\`php
<?php
$stmt = $conn->prepare("INSERT INTO users (name, email) VALUES (?, ?)");
$stmt->bind_param("ss", $name, $email);

$name = "John";
$email = "john@example.com";
$stmt->execute();

echo "Record inserted successfully";
$stmt->close();
?>
\`\`\``
    },
    {
      title: "Topic 9: Sessions and Cookies",
      content: `**User Session Management**

Sessions and cookies allow storing user information across multiple pages.

**Sessions:**

**1. Starting Session:**
\`\`\`php
<?php
session_start();
$_SESSION['username'] = "John";
$_SESSION['logged_in'] = true;
?>
\`\`\`

**2. Reading Session:**
\`\`\`php
<?php
session_start();
if (isset($_SESSION['username'])) {
    echo "Welcome " . $_SESSION['username'];
}
?>
\`\`\`

**3. Destroying Session:**
\`\`\`php
<?php
session_start();
session_destroy();
?>
\`\`\`

**Cookies:**

**1. Setting Cookie:**
\`\`\`php
<?php
setcookie("user", "John", time() + (86400 * 30), "/");
?>
\`\`\`

**2. Reading Cookie:**
\`\`\`php
<?php
if (isset($_COOKIE['user'])) {
    echo "User is: " . $_COOKIE['user'];
}
?>
\`\`\`

**Login System Example:**

\`\`\`php
<?php
session_start();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];
    
    // Verify credentials (simplified)
    if ($username == "admin" && $password == "pass123") {
        $_SESSION['logged_in'] = true;
        $_SESSION['username'] = $username;
        header("Location: dashboard.php");
    } else {
        echo "Invalid credentials";
    }
}
?>
\`\`\``
    },
    {
      title: "Topic 10: Best Practices and Security",
      content: `**PHP Security and Best Practices**

Following best practices and security principles is essential for professional PHP development.

**Security Basics:**

**1. Input Validation:**
\`\`\`php
<?php
$email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);
if (!$email) {
    die("Invalid email");
}
?>
\`\`\`

**2. SQL Injection Prevention:**
\`\`\`php
<?php
// WRONG - vulnerable to SQL injection
$sql = "SELECT * FROM users WHERE username = '$username'";

// CORRECT - using prepared statements
$stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
?>
\`\`\`

**3. XSS Prevention:**
\`\`\`php
<?php
// Always escape output
echo htmlspecialchars($user_input, ENT_QUOTES, 'UTF-8');
?>
\`\`\`

**Best Practices:**

**1. Error Handling:**
\`\`\`php
<?php
// In production
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Use try-catch
try {
    // Code
} catch (Exception $e) {
    error_log($e->getMessage());
}
?>
\`\`\`

**2. Password Security:**
\`\`\`php
<?php
// Hashing password
$hash = password_hash($password, PASSWORD_DEFAULT);

// Verifying password
if (password_verify($input, $hash)) {
    echo "Valid password";
}
?>
\`\`\`

**3. File Upload Security:**
- Validate file types
- Limit file sizes
- Store outside web root
- Generate unique filenames

**Code Organization:**
- Use functions and classes
- Follow PSR standards
- Comment your code
- Use meaningful variable names`
    }
  ],

  "default": [
    {
      title: `Introduction to default`,
      content: `Welcome to the default course. This comprehensive program will guide you through all essential aspects of this subject.`
    },
    {
      title: "Fundamentals and Core Concepts",
      content: `In this topic, we'll explore the fundamental principles and core concepts that form the foundation of default.`
    },
    {
      title: "Practical Applications",
      content: `Learn how to apply theoretical knowledge in real-world scenarios and practical situations.`
    },
    {
      title: "Advanced Techniques",
      content: `Dive deeper into advanced methods and techniques used by professionals in the field.`
    },
    {
      title: "Tools and Resources",
      content: `Discover the essential tools, resources, and platforms that will enhance your learning and practice.`
    },
    {
      title: "Best Practices",
      content: `Learn industry-standard best practices and methodologies to excel in default.`
    },
    {
      title: "Common Challenges and Solutions",
      content: `Understand common obstacles you might face and effective strategies to overcome them.`
    },
    {
      title: "Case Studies",
      content: `Analyze real-world case studies and examples to better understand practical implementations.`
    },
    {
      title: "Future Trends",
      content: `Explore emerging trends and future developments in the field of default.`
    },
    {
      title: "Final Review and Assessment Preparation",
      content: `Review all key concepts and prepare for your final assessment. This topic consolidates everything you've learned.`
    }
  ],
  "Financial Planning": [
    {
      title: "Introduction to Financial Planning",
        content: `# Introduction to Financial Planning

Financial planning is a systematic approach to managing your finances to achieve life goals. It involves assessing your current financial situation, setting objectives, and creating strategies to meet those objectives.

## What is Financial Planning?

Financial planning is the process of:
- Analyzing your current financial position
- Setting short-term and long-term financial goals
- Developing strategies to achieve those goals
- Implementing and monitoring your plan
- Adjusting as circumstances change

## Benefits of Financial Planning

1. **Clarity and Direction**: Provides a roadmap for your financial future
2. **Better Decision Making**: Helps you make informed choices about money
3. **Financial Security**: Builds a safety net for emergencies
4. **Goal Achievement**: Increases likelihood of reaching financial objectives
5. **Reduced Stress**: Provides peace of mind about your financial future

## The Financial Planning Process

1. Establish goals and objectives
2. Gather financial data
3. Analyze current situation
4. Develop the plan
5. Implement the plan
6. Monitor and review regularly

Financial planning is not a one-time event but an ongoing process that evolves with your life circumstances.`
      },
      {
        title: "Setting Financial Goals",
        content: `# Setting Financial Goals

Effective financial planning starts with clear, well-defined goals. Your financial goals guide all your financial decisions and strategies.

## Types of Financial Goals

### Short-term Goals (1-3 years)
- Emergency fund
- Vacation savings
- Small purchases
- Paying off credit card debt

### Medium-term Goals (3-10 years)
- Down payment for a house
- Starting a business
- Major home renovation
- Paying off student loans

### Long-term Goals (10+ years)
- Retirement savings
- Children's education
- Financial independence
- Estate planning

## SMART Goal Framework

Make your goals SMART:
- **Specific**: Clearly defined and detailed
- **Measurable**: Quantifiable with specific numbers
- **Achievable**: Realistic given your situation
- **Relevant**: Aligned with your values and priorities
- **Time-bound**: Has a specific deadline

### Example of a SMART Goal
❌ "I want to save money"
✅ "I will save $10,000 for a house down payment within 2 years by setting aside $420 per month"

## Prioritizing Your Goals

1. List all your financial goals
2. Categorize by timeframe
3. Rank by importance
4. Consider trade-offs
5. Focus on what matters most

Remember: It's okay to have multiple goals, but prioritize to avoid spreading yourself too thin.`
      },
      {
        title: "Creating a Budget",
        content: `# Creating a Budget

A budget is the foundation of financial planning. It helps you track income and expenses, ensuring you're living within your means and working toward your goals.

## Why Budget?

- Control your spending
- Avoid debt
- Save for goals
- Prepare for emergencies
- Reduce financial stress

## Popular Budgeting Methods

### 50/30/20 Rule
- 50% - Needs (housing, food, utilities)
- 30% - Wants (entertainment, dining out)
- 20% - Savings and debt repayment

### Zero-Based Budget
Every dollar is assigned a specific purpose. Income minus expenses equals zero.

### Envelope System
Cash is divided into envelopes for different spending categories.

### Pay Yourself First
Save a set amount before budgeting for expenses.

## Steps to Create Your Budget

1. **Calculate Your Income**
   - Salary (after taxes)
   - Side income
   - Investment returns
   - Other sources

2. **Track Your Expenses**
   - Fixed expenses (rent, insurance)
   - Variable expenses (groceries, gas)
   - Discretionary spending (entertainment)

3. **Set Spending Limits**
   - Based on your income
   - Aligned with your goals
   - Realistic and sustainable

4. **Monitor and Adjust**
   - Review monthly
   - Identify overspending
   - Make necessary changes

## Budgeting Tools

- Spreadsheets
- Mobile apps (Mint, YNAB, EveryDollar)
- Banking tools
- Pen and paper

The best budget is one you'll actually stick to!`
      },
      {
        title: "Emergency Funds and Savings",
        content: `# Emergency Funds and Savings

An emergency fund is one of the most important components of financial security. It provides a financial cushion for unexpected expenses or income loss.

## What is an Emergency Fund?

An emergency fund is money set aside specifically for unexpected expenses such as:
- Medical emergencies
- Job loss
- Car repairs
- Home repairs
- Unexpected travel

## How Much Should You Save?

### General Guidelines
- **Minimum**: $1,000 for basic emergencies
- **Standard**: 3-6 months of expenses
- **Extended**: 6-12 months for single income, self-employed, or unstable industries

### Calculate Your Target
1. Add up monthly essential expenses
2. Multiply by 3-6 (or more)
3. This is your emergency fund goal

Example: $3,000/month × 6 months = $18,000 target

## Building Your Emergency Fund

### Step-by-Step Approach
1. Start with a small goal ($500-$1,000)
2. Automate savings transfers
3. Save windfalls (tax refunds, bonuses)
4. Reduce expenses temporarily
5. Gradually increase to full target

### Where to Keep Emergency Funds
- High-yield savings account
- Money market account
- Easily accessible, liquid accounts
- NOT in stocks or long-term investments

## Beyond Emergency Funds: Other Savings Goals

1. **Short-term Savings**
   - Vacation fund
   - Gift fund
   - Annual expenses (insurance, taxes)

2. **Sinking Funds**
   - Car replacement
   - Home maintenance
   - Technology upgrades

3. **Opportunity Fund**
   - For unexpected opportunities
   - Career development
   - Strategic investments

Remember: Save first, spend what's left!`
      },
      {
        title: "Managing Debt",
        content: `# Managing Debt

Effective debt management is crucial for financial health. Not all debt is bad, but understanding how to manage it is essential.

## Types of Debt

### Good Debt
Debt that can increase your net worth or income:
- Student loans (education investment)
- Mortgage (home ownership)
- Business loans (income generation)

### Bad Debt
Debt used for depreciating items or consumption:
- Credit card debt (high interest)
- Auto loans for luxury vehicles
- Payday loans

## Debt Repayment Strategies

### Debt Snowball Method
1. List debts from smallest to largest
2. Pay minimums on all debts
3. Put extra money toward smallest debt
4. When paid off, roll payment to next smallest
5. Repeat until debt-free

**Advantage**: Psychological wins, builds momentum

### Debt Avalanche Method
1. List debts from highest to lowest interest rate
2. Pay minimums on all debts
3. Put extra money toward highest interest debt
4. When paid off, move to next highest
5. Repeat until debt-free

**Advantage**: Saves most money on interest

## Credit Score Management

Your credit score (300-850) affects:
- Loan approval
- Interest rates
- Insurance premiums
- Housing applications

### Factors Affecting Credit Score
- Payment history (35%)
- Credit utilization (30%)
- Length of credit history (15%)
- New credit (10%)
- Credit mix (10%)

### Improving Your Credit Score
1. Pay bills on time, always
2. Keep credit utilization below 30%
3. Don't close old credit cards
4. Limit new credit applications
5. Monitor your credit report regularly

## When to Avoid New Debt

- During financial instability
- For wants vs. needs
- When emergency fund is depleted
- If struggling with existing debt

Focus on becoming debt-free to build wealth!`
      },
      {
        title: "Investment Basics",
        content: `# Investment Basics

Investing is how you grow your wealth over time. Understanding investment fundamentals is key to achieving long-term financial goals.

## Why Invest?

- **Compound Growth**: Your money grows exponentially over time
- **Beat Inflation**: Preserve purchasing power
- **Build Wealth**: Achieve financial independence
- **Passive Income**: Generate income without active work

## Investment Vehicles

### Stocks (Equities)
- Ownership shares in companies
- Higher risk, higher potential return
- Suitable for long-term growth

### Bonds (Fixed Income)
- Loans to governments or corporations
- Lower risk, lower return
- Provides steady income

### Mutual Funds
- Pooled investments managed professionally
- Diversification in one purchase
- Various types (stock, bond, balanced)

### Index Funds
- Tracks market indexes (S&P 500)
- Low fees
- Passive management

### ETFs (Exchange-Traded Funds)
- Similar to index funds
- Trade like stocks
- Very low fees

### Real Estate
- Physical property investment
- Rental income + appreciation
- Requires more capital and management

## Key Investment Principles

### 1. Diversification
Don't put all eggs in one basket. Spread investments across:
- Different asset classes
- Various industries
- Geographic regions

### 2. Asset Allocation
Mix of investments based on:
- Age
- Risk tolerance
- Time horizon
- Goals

Example: 60% stocks, 30% bonds, 10% cash

### 3. Time Horizon
- Short-term (< 3 years): Conservative, liquid investments
- Medium-term (3-10 years): Balanced approach
- Long-term (10+ years): Aggressive growth

### 4. Risk vs. Return
- Higher potential returns = Higher risk
- Lower risk = Lower potential returns
- Match risk to your comfort level

## Getting Started

1. **Max out employer 401(k) match** (free money!)
2. **Open an IRA** (Individual Retirement Account)
3. **Start with index funds** (simple, diversified)
4. **Invest regularly** (dollar-cost averaging)
5. **Don't try to time the market**
6. **Stay invested long-term**

Remember: Time in the market beats timing the market!`
      },
      {
        title: "Retirement Planning",
        content: `# Retirement Planning

Planning for retirement is one of the most important aspects of financial planning. The earlier you start, the better positioned you'll be.

## Why Start Early?

### The Power of Compound Interest

Example: Starting at 25 vs. 35
- Starting at 25: Save $200/month until 65 = $470,000
- Starting at 35: Save $200/month until 65 = $230,000

Starting 10 years earlier more than doubles your retirement savings!

## How Much Do You Need?

### The 25x Rule
Multiply annual retirement expenses by 25

Example: $40,000/year × 25 = $1,000,000 needed

### The 4% Rule
Withdraw 4% of retirement savings annually

Example: $1,000,000 × 4% = $40,000/year

## Retirement Accounts

### Employer-Sponsored Plans

**401(k) / 403(b)**
- Tax-deferred contributions
- Employer match (free money!)
- 2024 limit: $23,000/year
- Withdrawals taxed in retirement

**Roth 401(k)**
- After-tax contributions
- Tax-free withdrawals in retirement
- No income limits

### Individual Retirement Accounts (IRAs)

**Traditional IRA**
- Tax-deductible contributions
- Tax-deferred growth
- Withdrawals taxed in retirement
- 2024 limit: $7,000/year

**Roth IRA**
- After-tax contributions
- Tax-free growth and withdrawals
- Income limits apply
- More withdrawal flexibility

## Retirement Planning Strategy

### In Your 20s-30s
- Take advantage of time
- Invest aggressively (80-90% stocks)
- Maximize employer match
- Start Roth IRA

### In Your 40s-50s
- Increase savings rate
- Moderate risk (60-70% stocks)
- Catch-up contributions
- Diversify investments

### In Your 60s+
- Reduce risk (40-50% stocks)
- Plan withdrawal strategy
- Consider healthcare costs
- Social Security timing

## Additional Considerations

- **Social Security**: Understand benefits and timing
- **Healthcare**: Plan for Medicare and supplemental insurance
- **Long-term Care**: Consider insurance or savings
- **Estate Planning**: Wills, trusts, beneficiaries

Start planning today for a comfortable tomorrow!`
      },
      {
        title: "Tax Planning Strategies",
        content: `# Tax Planning Strategies

Effective tax planning can significantly impact your financial health. Understanding tax strategies helps you keep more of your hard-earned money.

## Why Tax Planning Matters

- Reduce taxable income legally
- Maximize deductions and credits
- Optimize investment returns
- Plan for future tax liability
- Increase cash flow

## Tax-Advantaged Accounts

### Retirement Accounts
**Benefits:**
- Reduce current taxable income
- Tax-deferred or tax-free growth
- Build retirement savings

**Options:**
- 401(k), 403(b), Traditional IRA (tax-deferred)
- Roth IRA, Roth 401(k) (tax-free growth)
- SEP IRA, Solo 401(k) (self-employed)

### Health Savings Account (HSA)
**Triple Tax Advantage:**
1. Tax-deductible contributions
2. Tax-free growth
3. Tax-free withdrawals for medical expenses

**Requirements:**
- High-deductible health plan
- 2024 limit: $4,150 (individual), $8,300 (family)

### 529 Education Savings Plans
- Tax-free growth for education
- Tax-free withdrawals for qualified expenses
- Some states offer tax deductions

## Common Tax Deductions

### Standard vs. Itemized Deductions
- Standard deduction (2024): $14,600 (single), $29,200 (married)
- Itemize if deductions exceed standard

### Itemizable Deductions
- Mortgage interest
- State and local taxes (SALT) - $10,000 limit
- Charitable contributions
- Medical expenses (>7.5% of AGI)

## Tax Credits (Better Than Deductions!)

### Refundable Credits
- Earned Income Tax Credit (EITC)
- Child Tax Credit
- American Opportunity Credit (education)

### Non-Refundable Credits
- Lifetime Learning Credit
- Child and Dependent Care Credit
- Retirement Savings Contribution Credit (Saver's Credit)

## Investment Tax Strategies

### Tax-Loss Harvesting
- Sell investments at a loss
- Offset capital gains
- Reduce taxable income (up to $3,000/year)
- Reinvest in similar assets

### Long-Term Capital Gains
- Hold investments >1 year
- Lower tax rates (0%, 15%, 20%)
- vs. short-term (ordinary income rates)

### Dividend Strategy
- Qualified dividends taxed at lower rates
- Consider dividend-paying stocks in taxable accounts

## Business and Self-Employment

### Deductions for Self-Employed
- Home office deduction
- Business expenses
- Health insurance premiums
- Retirement contributions (SEP-IRA, Solo 401(k))
- Self-employment tax deduction (50%)

## Year-End Tax Strategies

1. **Maximize retirement contributions**
2. **Harvest tax losses**
3. **Make charitable donations**
4. **Pay deductible expenses**
5. **Consider Roth conversions**
6. **Review withholdings**

Consult a tax professional for personalized advice!`
      },
      {
        title: "Insurance and Risk Management",
        content: `# Insurance and Risk Management

Insurance is a critical component of financial planning. It protects you from financial devastation due to unexpected events.

## Why Insurance Matters

- Protects against financial catastrophes
- Provides peace of mind
- Required by law (some types)
- Protects your family's financial future

## Types of Insurance

### Life Insurance

**Purpose**: Provides for dependents after your death

**Term Life Insurance**
- Coverage for specific period (10, 20, 30 years)
- Lower premiums
- No cash value
- Best for most people

**Permanent Life Insurance**
- Whole life, universal life
- Lifetime coverage
- Cash value component
- Higher premiums
- More complex

**How Much Do You Need?**
- 10-12x annual income
- Or enough to cover: debts + income replacement + future expenses

### Health Insurance

**Essential Coverage:**
- Medical expenses
- Preventive care
- Emergency care
- Prescriptions

**Key Concepts:**
- Premium: Monthly payment
- Deductible: Amount you pay before insurance kicks in
- Copay: Fixed amount per visit
- Out-of-pocket maximum: Most you'll pay per year

### Disability Insurance

**Purpose**: Replaces income if you can't work due to illness/injury

**Types:**
- Short-term disability (3-6 months)
- Long-term disability (until retirement age)

**Coverage Amount:**
- Typically 60-70% of income
- Often provided by employer
- Consider supplemental coverage

### Homeowners/Renters Insurance

**Homeowners Insurance Covers:**
- Dwelling and structures
- Personal property
- Liability
- Additional living expenses

**Renters Insurance Covers:**
- Personal property
- Liability
- Additional living expenses
- Often very affordable ($15-30/month)

### Auto Insurance

**Required Coverage (varies by state):**
- Liability (bodily injury and property damage)

**Recommended Coverage:**
- Collision
- Comprehensive
- Uninsured/underinsured motorist
- Medical payments

### Umbrella Insurance

- Additional liability coverage
- Kicks in after other policies max out
- Covers: lawsuits, injuries, property damage
- Relatively inexpensive ($150-300/year for $1M)

## Long-Term Care Insurance

**Purpose**: Covers nursing home, assisted living, in-home care

**Considerations:**
- Average cost: $100,000/year for nursing home
- Medicare doesn't cover long-term care
- Buy in your 50s-60s for best rates
- Alternative: Save aggressively in HSA/investments

## Insurance Best Practices

### Do:
1. **Shop around** for best rates
2. **Review annually** and adjust as needed
3. **Increase deductibles** to lower premiums
4. **Bundle policies** for discounts
5. **Maintain good credit** (affects rates)
6. **Take advantage of discounts** (safety features, good driver)

### Don't:
1. **Under-insure** to save money
2. **Over-insure** what you don't need
3. **Let policies lapse**
4. **Ignore policy details**

## Emergency Preparedness

Beyond insurance:
- Emergency fund (3-6 months expenses)
- Important documents in safe place
- Estate planning documents
- Family emergency plan

Proper insurance = Financial safety net!`
      },
      {
        title: "Estate Planning Basics",
        content: `# Estate Planning Basics

Estate planning ensures your assets are distributed according to your wishes and your loved ones are cared for after you're gone.

## What is Estate Planning?

Estate planning involves:
- Deciding how assets are distributed
- Naming guardians for minor children
- Minimizing taxes and legal fees
- Providing for dependents
- Making healthcare decisions
- Planning for incapacity

## Essential Estate Planning Documents

### 1. Last Will and Testament

**Purpose**: Specifies how assets are distributed

**Should Include:**
- Executor (person who carries out will)
- Beneficiaries (who receives what)
- Guardians for minor children
- Specific bequests (heirlooms, property)

**Without a Will:**
- State decides asset distribution
- May not align with your wishes
- Longer, more expensive process

### 2. Living Trust

**Purpose**: Manages assets during life and after death

**Benefits:**
- Avoids probate (faster, private)
- Maintains control while alive
- Reduces estate taxes
- Protects assets

**Types:**
- Revocable (can be changed)
- Irrevocable (permanent, stronger protection)

### 3. Power of Attorney (POA)

**Financial POA:**
- Manages finances if you're incapacitated
- Pays bills, manages investments
- Files taxes

**Healthcare POA:**
- Makes medical decisions if you can't
- Also called healthcare proxy

### 4. Living Will (Advance Directive)

**Purpose**: Specifies end-of-life medical preferences

**Covers:**
- Life support decisions
- Resuscitation preferences
- Organ donation
- Pain management

### 5. Beneficiary Designations

**Accounts with Beneficiaries:**
- Retirement accounts (401(k), IRA)
- Life insurance policies
- Bank/investment accounts (TOD/POD)

**Important:**
- Review and update regularly
- Supersede will
- Avoid naming minors directly

## Estate Tax Planning

### Federal Estate Tax
- 2024 exemption: $13.61 million per person
- 40% tax on amount over exemption
- Married couples: Double exemption

### Strategies to Reduce Estate Taxes
- Annual gift exclusion ($18,000/person in 2024)
- Charitable donations
- Trusts (bypass, charitable)
- Life insurance trusts

## Special Considerations

### For Parents
- Name guardians in will
- Create trusts for minor children
- Consider life insurance
- Education savings (529 plans)

### For Business Owners
- Succession plan
- Buy-sell agreements
- Business valuation
- Key person insurance

### For Blended Families
- Clear documentation
- Consider trusts
- Update beneficiaries
- Communicate with family

## Digital Estate Planning

Don't forget digital assets:
- Email and social media accounts
- Digital photos and files
- Cryptocurrency
- Online banking
- Subscription services

**Create a Digital Asset Inventory:**
- List of accounts
- Usernames (not passwords in will!)
- Instructions for executor
- Use password manager with emergency access

## When to Update Your Estate Plan

Review and update after:
- Marriage or divorce
- Birth/adoption of children
- Death of beneficiary or executor
- Significant change in assets
- Moving to another state
- Major tax law changes
- Every 3-5 years minimum

## Getting Started

1. **Take inventory** of assets and debts
2. **Decide on beneficiaries** and guardians
3. **Choose executors and POAs**
4. **Consult an attorney** for will/trust
5. **Complete documents** and sign properly
6. **Store safely** and inform family
7. **Review regularly** and update as needed

Estate planning isn't just for the wealthy—it's for everyone who cares about their family's future!`
    }
  ]
};

export const generateDefaultTopics = (courseName: string): Topic[] => {
  return [
    {
      title: `Introduction to ${courseName}`,
      content: `Welcome to the ${courseName} course. This comprehensive program will guide you through all essential aspects of this subject.`
    },
    {
      title: "Fundamentals and Core Concepts",
      content: `In this topic, we'll explore the fundamental principles and core concepts that form the foundation of ${courseName}.`
    },
    {
      title: "Practical Applications",
      content: `Learn how to apply theoretical knowledge in real-world scenarios and practical situations.`
    },
    {
      title: "Advanced Techniques",
      content: `Dive deeper into advanced methods and techniques used by professionals in the field.`
    },
    {
      title: "Tools and Resources",
      content: `Discover the essential tools, resources, and platforms that will enhance your learning and practice.`
    },
    {
      title: "Best Practices",
      content: `Learn industry-standard best practices and methodologies to excel in ${courseName}.`
    },
    {
      title: "Common Challenges and Solutions",
      content: `Understand common obstacles you might face and effective strategies to overcome them.`
    },
    {
      title: "Case Studies",
      content: `Analyze real-world case studies and examples to better understand practical implementations.`
    },
    {
      title: "Future Trends",
      content: `Explore emerging trends and future developments in the field of ${courseName}.`
    },
    {
      title: "Final Review and Assessment Preparation",
      content: `Review all key concepts and prepare for your final assessment. This topic consolidates everything you've learned.`
    }
  ];
};
