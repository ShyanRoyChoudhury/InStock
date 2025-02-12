CREATE TABLE Products (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()), -- UUID as primary key
    shopifyProductId VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(50),
    description VARCHAR(500),
    deleted BOOL DEFAULT(False)
);

CREATE TABLE Variant (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()), -- UUID as primary key
    shopifyVariantId VARCHAR(50) NOT NULL,
    productId CHAR(36) NOT NULL, -- References Products(id)
    name VARCHAR(50),
    CONSTRAINT fk_variant_product FOREIGN KEY (productId) REFERENCES Products(id),
    deleted BOOL DEFAULT(False)
);

CREATE TABLE VariantValue (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()), -- UUID as primary key
    variantId CHAR(36) NOT NULL, -- References Variant(id)
    value VARCHAR(50) NOT NULL,
    CONSTRAINT fk_variant_value FOREIGN KEY (variantId) REFERENCES Variant(id),
    deleted BOOL DEFAULT(False)
);

CREATE TABLE VariantPrice (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()), -- UUID as primary key
    variantValueId CHAR(36) NOT NULL, -- References VariantValue(id)
    price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_variant_price FOREIGN KEY (variantValueId) REFERENCES VariantValue(id),
    deleted BOOL DEFAULT(False)
);
