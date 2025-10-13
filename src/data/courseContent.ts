export interface Topic {
  title: string;
  content: string;
}

export const courseContent: Record<string, Topic[]> = {
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
