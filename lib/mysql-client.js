import { createPool } from 'mysql2/promise'

let pool = null

export async function getMysqlPool() {
  if (pool) return pool

  const {
    MYSQL_HOST,
    MYSQL_PORT,
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_DATABASE,
    MYSQL_SSL,
  } = process.env

  if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_PASSWORD || !MYSQL_DATABASE) {
    throw new Error('Missing MySQL connection settings in environment variables')
  }

  pool = createPool({
    host: MYSQL_HOST,
    port: Number(MYSQL_PORT || 3306),
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl:
      MYSQL_SSL === 'true' || MYSQL_SSL === '1'
        ? { rejectUnauthorized: false }
        : undefined,
  })

  await ensureSchema(pool)

  return pool
}


async function ensureSchema(pool) {

  // ==============================
  // CATEGORIES
  // ==============================

  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      image TEXT DEFAULT '',
      bannerImage TEXT DEFAULT '',
      icon TEXT DEFAULT '',
      seoTitle VARCHAR(255) DEFAULT '',
      seoDescription TEXT DEFAULT '',
      keywords TEXT DEFAULT '',
      status ENUM('published','draft','archived')
        NOT NULL DEFAULT 'published',
      sortOrder INT NOT NULL DEFAULT 0,
      parentCategoryId INT DEFAULT NULL,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL,

      UNIQUE KEY uq_category_slug (slug),
      KEY idx_categories_status_sort (status, sortOrder),
      KEY idx_categories_parent (parentCategoryId)

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)


  await pool.query(`
    CREATE TABLE IF NOT EXISTS subcategories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      bannerImage TEXT DEFAULT '',
      icon TEXT DEFAULT '',
      seoTitle VARCHAR(255) DEFAULT '',
      seoDescription TEXT DEFAULT '',
      keywords TEXT DEFAULT '',
      status ENUM('published','draft','archived')
        NOT NULL DEFAULT 'published',
      sortOrder INT NOT NULL DEFAULT 0,
      categoryId INT DEFAULT NULL,
      parentId INT DEFAULT NULL,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL,

      UNIQUE KEY uq_subcategory_slug (slug),
      KEY idx_subcategories_status_sort (status, sortOrder),
      KEY idx_subcategories_category (categoryId),
      KEY idx_subcategories_parent (parentId)

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)


  // ==============================
  // ATTRIBUTES
  // ==============================

  await pool.query(`
    CREATE TABLE IF NOT EXISTS attributes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      attributeType VARCHAR(40)
        NOT NULL DEFAULT 'text',
      units VARCHAR(255) DEFAULT '',
      validation TEXT DEFAULT '',
      required TINYINT(1) NOT NULL DEFAULT 0,
      applicableCategories JSON DEFAULT NULL,
      status ENUM('published','draft','archived')
        NOT NULL DEFAULT 'published',
      sortOrder INT NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL,

      UNIQUE KEY uq_attribute_slug (slug),
      KEY idx_attributes_status_sort (status, sortOrder)

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)


  // ==============================
  // PACKAGING TYPES
  // ==============================

  await pool.query(`
    CREATE TABLE IF NOT EXISTS packaging_types (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT DEFAULT '',
      status ENUM('published','draft','archived')
        NOT NULL DEFAULT 'published',
      sortOrder INT NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL,

      UNIQUE KEY uq_packaging_type_slug (slug),
      KEY idx_packaging_types_status_sort (status, sortOrder)

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)


  // ==============================
  // EXPORT COUNTRIES
  // ==============================

  await pool.query(`
    CREATE TABLE IF NOT EXISTS export_countries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      slug VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(10) DEFAULT '',
      status ENUM('published','draft','archived')
        NOT NULL DEFAULT 'published',
      sortOrder INT NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL,

      UNIQUE KEY uq_export_country_slug (slug),
      KEY idx_export_countries_status_sort (status, sortOrder)

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)


  // ==============================
  // SAFE FOREIGN KEYS
  // ==============================

  const foreignKeys = [

    `
    ALTER TABLE categories
    ADD CONSTRAINT fk_categories_parent
    FOREIGN KEY (parentCategoryId)
    REFERENCES categories(id)
    ON DELETE SET NULL
    `,

    `
    ALTER TABLE subcategories
    ADD CONSTRAINT fk_subcategories_category
    FOREIGN KEY (categoryId)
    REFERENCES categories(id)
    ON DELETE SET NULL
    `,

    `
    ALTER TABLE subcategories
    ADD CONSTRAINT fk_subcategories_parent
    FOREIGN KEY (parentId)
    REFERENCES subcategories(id)
    ON DELETE SET NULL
    `
  ]


  for (const sql of foreignKeys) {
    try {
      await pool.query(sql)
    } catch (error) {
      if (!/Duplicate|already exists/i.test(error.message)) {
        throw error
      }
    }
  }


  // Continue with Part 2...

    // ==============================
  // PRODUCTS
  // ==============================

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,

      slug VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,

      category VARCHAR(255) NOT NULL,
      subcategory VARCHAR(255) DEFAULT '',

      tagline TEXT DEFAULT '',
      shortDescription TEXT DEFAULT '',
      longDescription TEXT DEFAULT '',

      hero TEXT DEFAULT '',

      gallery TEXT DEFAULT '[]',
      certifications TEXT DEFAULT '[]',
      applications TEXT DEFAULT '[]',
      packaging TEXT DEFAULT '[]',
      exportMarkets TEXT DEFAULT '[]',

      specs TEXT DEFAULT '[]',
      details TEXT DEFAULT '{}',

      status ENUM('published','draft','archived')
        NOT NULL DEFAULT 'published',

      featured TINYINT(1) NOT NULL DEFAULT 0,

      hsCode VARCHAR(64) DEFAULT '',
      origin VARCHAR(255) DEFAULT '',
      shelfLife VARCHAR(255) DEFAULT '',
      seasonAvailability VARCHAR(255) DEFAULT '',

      seoTitle VARCHAR(255) DEFAULT '',
      seoDescription TEXT DEFAULT '',
      keywords TEXT DEFAULT '',
      ogImage TEXT DEFAULT '',

      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL,


      UNIQUE KEY uq_product_slug (slug),
      KEY idx_products_category_status (category,status),
      KEY idx_products_featured (featured,status)

    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)



  // ==============================
  // PRODUCT ATTRIBUTE VALUES
  // ==============================

  await pool.query(`
    CREATE TABLE IF NOT EXISTS product_attribute_values (

      id INT AUTO_INCREMENT PRIMARY KEY,

      productId INT NOT NULL,

      attributeId INT NOT NULL,

      value TEXT DEFAULT '',


      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL,


      UNIQUE KEY uq_product_attribute
      (productId,attributeId),


      KEY idx_pav_product(productId),

      KEY idx_pav_attribute(attributeId),


      CONSTRAINT fk_pav_product

      FOREIGN KEY(productId)

      REFERENCES products(id)

      ON DELETE CASCADE,


      CONSTRAINT fk_pav_attribute

      FOREIGN KEY(attributeId)

      REFERENCES attributes(id)

      ON DELETE CASCADE


    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)



  // ==============================
  // MEDIA ASSETS
  // ==============================

  await pool.query(`
    CREATE TABLE IF NOT EXISTS media_assets (

      id INT AUTO_INCREMENT PRIMARY KEY,

      assetType VARCHAR(80)
        NOT NULL DEFAULT 'image',

      entityType VARCHAR(80)
        NOT NULL DEFAULT 'general',

      filename VARCHAR(255)
        NOT NULL,

      mimeType VARCHAR(120)
        DEFAULT '',

      sizeBytes INT
        NOT NULL DEFAULT 0,

      url TEXT NOT NULL,

      fileData LONGBLOB,

      contentType VARCHAR(120) DEFAULT '',

      createdAt DATETIME NOT NULL,

      updatedAt DATETIME NOT NULL,


      KEY idx_media_assets_entity
      (entityType,assetType)


    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)

  const mediaColumnStatements = [
    "ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS fileData LONGBLOB NULL",
    "ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS contentType VARCHAR(120) DEFAULT ''"
  ]

  for (const statement of mediaColumnStatements) {
    try {
      await pool.query(statement)
    } catch (error) {
      if (!/(Duplicate column|already exists)/i.test(error.message || '')) {
        throw error
      }
    }
  }



  // ==============================
  // PRODUCT EXTRA COLUMNS
  // ==============================

  const schemaAdjustments = [

    "ALTER TABLE categories ADD COLUMN IF NOT EXISTS canonicalUrl TEXT DEFAULT ''",

    "ALTER TABLE categories ADD COLUMN IF NOT EXISTS ogImage TEXT DEFAULT ''",


    "ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS keywords TEXT DEFAULT ''",

    "ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS canonicalUrl TEXT DEFAULT ''",

    "ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS ogImage TEXT DEFAULT ''",


    "ALTER TABLE products ADD COLUMN IF NOT EXISTS focusKeyword VARCHAR(255) DEFAULT ''",

    "ALTER TABLE products ADD COLUMN IF NOT EXISTS productDescription TEXT DEFAULT ''",

    "ALTER TABLE products ADD COLUMN IF NOT EXISTS technicalSpecifications TEXT DEFAULT '[]'",

    "ALTER TABLE products ADD COLUMN IF NOT EXISTS industriesServed TEXT DEFAULT '[]'",

    "ALTER TABLE products ADD COLUMN IF NOT EXISTS exportCountries TEXT DEFAULT '[]'",

    "ALTER TABLE products ADD COLUMN IF NOT EXISTS faq TEXT DEFAULT '[]'",

    "ALTER TABLE products ADD COLUMN IF NOT EXISTS relatedProducts TEXT DEFAULT '[]'",

    "ALTER TABLE products ADD COLUMN IF NOT EXISTS canonicalUrl TEXT DEFAULT ''"

  ]


  for (const statement of schemaAdjustments) {

    try {

      await pool.query(statement)

    } catch(error) {

      if (!/(Duplicate column|already exists)/i.test(error.message || '')) {

        throw error

      }

    }

  }




  // ==============================
  // RFQ TABLE
  // ==============================

  await pool.query(`
    CREATE TABLE IF NOT EXISTS rfqs (

      id VARCHAR(36) PRIMARY KEY,


      reference VARCHAR(32) NOT NULL,


      company VARCHAR(255) DEFAULT '',

      contactPerson VARCHAR(255) DEFAULT '',

      fullName VARCHAR(255) DEFAULT '',


      email VARCHAR(255) DEFAULT '',

      phone VARCHAR(64) DEFAULT '',


      country VARCHAR(255) DEFAULT '',


      productInterest VARCHAR(255) DEFAULT '',


      quantity VARCHAR(120) DEFAULT '',


      packaging VARCHAR(255) DEFAULT '',


      destinationPort VARCHAR(120) DEFAULT '',


      shippingTerms VARCHAR(40) DEFAULT '',


      notes TEXT DEFAULT '',


      message TEXT DEFAULT '',


      attachments TEXT DEFAULT '[]',


      status VARCHAR(40)
      DEFAULT 'new',


      priority VARCHAR(40)
      DEFAULT 'normal',


      assignedSalesPerson VARCHAR(255)
      DEFAULT '',


      followUpDate VARCHAR(50)
      DEFAULT '',


      history TEXT DEFAULT '[]',


      targetPrice VARCHAR(80)
      DEFAULT '',


      preferredCurrency VARCHAR(10)
      DEFAULT 'USD',


      shipmentDate VARCHAR(50)
      DEFAULT '',


      customSpecifications TEXT DEFAULT '',


      sourcePage VARCHAR(255)
      DEFAULT '',


      ipAddress VARCHAR(64)
      DEFAULT 'unknown',


      createdAt DATETIME NOT NULL,

      updatedAt DATETIME NOT NULL,


      UNIQUE KEY uq_rfq_reference(reference),

      KEY idx_rfqs_status_created(status,createdAt),

      KEY idx_rfqs_email(email)


    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)
  // ==============================
// RFQ COLUMN UPDATES
// ==============================

const rfqColumnStatements = [

  "ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS fullName VARCHAR(255) DEFAULT ''",

  "ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS message TEXT DEFAULT ''",

  "ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS targetPrice VARCHAR(80) DEFAULT ''",

  "ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS preferredCurrency VARCHAR(10) DEFAULT 'USD'",

  "ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS shipmentDate VARCHAR(50) DEFAULT ''",

  "ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS customSpecifications TEXT DEFAULT ''",

  "ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS sourcePage VARCHAR(255) DEFAULT ''",

  "ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS ipAddress VARCHAR(64) DEFAULT 'unknown'"

]


for (const statement of rfqColumnStatements) {

  try {

    await pool.query(statement)

  } catch(error) {

    if (!/(Duplicate column|already exists)/i.test(error.message || '')) {

      throw error

    }

  }

}



// ==============================
// USERS
// ==============================

await pool.query(`

CREATE TABLE IF NOT EXISTS users (

  id VARCHAR(36) PRIMARY KEY,

  email VARCHAR(255) NOT NULL,

  passwordHash VARCHAR(255) NOT NULL,


  role ENUM(
    'super-admin',
    'admin',
    'sales-manager',
    'sales-executive',
    'content-manager',
    'customer'
  )

  NOT NULL DEFAULT 'admin',


  name VARCHAR(255) DEFAULT '',

  company VARCHAR(255) DEFAULT '',


  status ENUM('active','inactive')

  NOT NULL DEFAULT 'active',


  createdAt DATETIME NOT NULL,

  updatedAt DATETIME NOT NULL,


  lastLoginAt DATETIME DEFAULT NULL,


  UNIQUE KEY uq_user_email(email),

  KEY idx_users_role_status(role,status)


)

ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

`)



// ==============================
// CUSTOMERS
// ==============================

await pool.query(`

CREATE TABLE IF NOT EXISTS customers (

  id VARCHAR(36) PRIMARY KEY,


  customer_number VARCHAR(32) NOT NULL,


  full_name VARCHAR(255) NOT NULL,


  company_name VARCHAR(255) NOT NULL,


  email VARCHAR(255) NOT NULL,


  phone VARCHAR(64) DEFAULT '',


  country VARCHAR(255) DEFAULT '',


  password_hash VARCHAR(255) NOT NULL,


  email_verified TINYINT(1)
  NOT NULL DEFAULT 0,


  otp VARCHAR(6) DEFAULT NULL,


  otp_expiry DATETIME DEFAULT NULL,


  address TEXT DEFAULT '',


  gst_number VARCHAR(32) DEFAULT '',


  website VARCHAR(255) DEFAULT '',


  profile_picture TEXT DEFAULT '',


  status VARCHAR(40)
  NOT NULL DEFAULT 'active',


  last_login DATETIME DEFAULT NULL,


  login_attempts INT DEFAULT 0,


  last_login_attempt DATETIME DEFAULT NULL,


  created_at DATETIME NOT NULL,


  updated_at DATETIME NOT NULL,


  UNIQUE KEY uq_customer_email(email),

  UNIQUE KEY uq_customer_number(customer_number),


  KEY idx_customers_status(status),

  KEY idx_customers_email_verified(email_verified)


)

ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

`)




// ==============================
// CUSTOMER EXTRA COLUMNS
// ==============================

const customerColumnStatements = [

"ALTER TABLE customers ADD COLUMN IF NOT EXISTS full_name VARCHAR(255) DEFAULT ''",

"ALTER TABLE customers ADD COLUMN IF NOT EXISTS company_name VARCHAR(255) DEFAULT ''",

"ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone VARCHAR(64) DEFAULT ''",

"ALTER TABLE customers ADD COLUMN IF NOT EXISTS country VARCHAR(255) DEFAULT ''",

"ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255) DEFAULT ''",

"ALTER TABLE customers ADD COLUMN IF NOT EXISTS email_verified TINYINT(1) DEFAULT 0",

"ALTER TABLE customers ADD COLUMN IF NOT EXISTS otp VARCHAR(6) DEFAULT NULL",

"ALTER TABLE customers ADD COLUMN IF NOT EXISTS otp_expiry DATETIME DEFAULT NULL",

"ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT DEFAULT ''",

"ALTER TABLE customers ADD COLUMN IF NOT EXISTS gst_number VARCHAR(32) DEFAULT ''",

"ALTER TABLE customers ADD COLUMN IF NOT EXISTS website VARCHAR(255) DEFAULT ''",

"ALTER TABLE customers ADD COLUMN IF NOT EXISTS profile_picture TEXT DEFAULT ''",

"ALTER TABLE customers ADD COLUMN IF NOT EXISTS status VARCHAR(40) NOT NULL DEFAULT 'active'",

"ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_login DATETIME DEFAULT NULL",

"ALTER TABLE customers ADD COLUMN IF NOT EXISTS login_attempts INT DEFAULT 0",

"ALTER TABLE customers ADD COLUMN IF NOT EXISTS last_login_attempt DATETIME DEFAULT NULL"

]


for (const statement of customerColumnStatements) {

  try {

    await pool.query(statement)

  } catch(error) {

    if (!/(Duplicate column|already exists)/i.test(error.message || '')) {

      throw error

    }

  }

}



// ==============================
// RFQ CUSTOMER RELATION
// ==============================

try {

await pool.query(`

ALTER TABLE rfqs

ADD COLUMN IF NOT EXISTS customer_id VARCHAR(36),

ADD KEY idx_rfqs_customer(customer_id),

ADD CONSTRAINT fk_rfqs_customer

FOREIGN KEY(customer_id)

REFERENCES customers(id)

ON DELETE SET NULL

`)


} catch(error){

 if(!/(Duplicate|already exists)/i.test(error.message || '')){

   console.error(
   "RFQ customer relation:",
   error.message
   )

 }

}





// ==============================
// BLOGS
// ==============================

await pool.query(`

CREATE TABLE IF NOT EXISTS blogs (

 id VARCHAR(36) PRIMARY KEY,


 slug VARCHAR(255) NOT NULL,


 title VARCHAR(255) NOT NULL,


 excerpt TEXT DEFAULT '',


 content LONGTEXT DEFAULT '',


 authorId VARCHAR(36) DEFAULT NULL,


 status VARCHAR(40)
 DEFAULT 'draft',


 createdAt DATETIME NOT NULL,


 updatedAt DATETIME NOT NULL,


 UNIQUE KEY uq_blog_slug(slug),


 KEY idx_blogs_status_created(status,createdAt),


 CONSTRAINT fk_blogs_author

 FOREIGN KEY(authorId)

 REFERENCES users(id)

 ON DELETE SET NULL


)

ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

`)




// ==============================
// AUDIT LOGS
// ==============================

await pool.query(`

CREATE TABLE IF NOT EXISTS audit_logs (

 id VARCHAR(36) PRIMARY KEY,


 action VARCHAR(120) NOT NULL,


 userId VARCHAR(36) DEFAULT NULL,


 email VARCHAR(255) DEFAULT NULL,


 ipAddress VARCHAR(64)
 DEFAULT 'unknown',


 details JSON DEFAULT NULL,


 createdAt DATETIME NOT NULL,


 KEY idx_audit_action_created(action,createdAt),


 KEY idx_audit_user_created(userId,createdAt)


)

ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

`)


}
