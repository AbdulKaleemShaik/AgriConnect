-- Initial AgriConnect schema (MySQL 8).
-- Hibernate runs with ddl-auto=validate, so every entity change needs a new V<n>__*.sql migration.

create table users (
    id                            bigint       not null auto_increment,
    name                          varchar(100) not null,
    email                         varchar(150) not null,
    password                      varchar(255) not null,
    role                          enum ('ADMIN','CUSTOMER','FARMER') not null,
    mobile_number                 varchar(15),
    address                       varchar(255),
    city                          varchar(100),
    state                         varchar(100),
    pincode                       varchar(10),
    profile_image                 varchar(255),
    enabled                       bit          not null,
    failed_login_attempts         integer      not null,
    locked_until                  datetime(6),
    password_reset_otp_hash       varchar(255),
    password_reset_otp_expires_at datetime(6),
    password_reset_attempts       integer      not null,
    created_at                    datetime(6)  not null,
    primary key (id),
    constraint uk_users_email unique (email)
) engine=InnoDB;

create table categories (
    id     bigint       not null auto_increment,
    name   varchar(100) not null,
    active bit          not null,
    primary key (id),
    constraint uk_categories_name unique (name)
) engine=InnoDB;

create table products (
    id             bigint        not null auto_increment,
    farmer_id      bigint        not null,
    title          varchar(200)  not null,
    description    varchar(5000),
    category       varchar(100)  not null,
    price          decimal(12,2) not null,
    discount       integer       not null,
    discount_price decimal(12,2) not null,
    stock          integer       not null,
    image          varchar(255),
    active         bit           not null,
    deleted        bit           not null,
    -- Optimistic-locking version: concurrent checkouts of the same product cannot oversell stock.
    version        bigint        not null default 0,
    created_at     datetime(6)   not null,
    updated_at     datetime(6),
    primary key (id),
    constraint fk_products_farmer foreign key (farmer_id) references users (id)
) engine=InnoDB;

create index idx_products_category on products (category);
create index idx_products_farmer on products (farmer_id);

create table cart_items (
    id          bigint  not null auto_increment,
    customer_id bigint  not null,
    product_id  bigint  not null,
    quantity    integer not null,
    primary key (id),
    constraint uk_cart_customer_product unique (customer_id, product_id),
    constraint fk_cart_items_customer foreign key (customer_id) references users (id),
    constraint fk_cart_items_product foreign key (product_id) references products (id)
) engine=InnoDB;

create table orders (
    id              bigint        not null auto_increment,
    order_number    varchar(40)   not null,
    customer_id     bigint        not null,
    product_id      bigint        not null,
    quantity        integer       not null,
    unit_price      decimal(12,2) not null,
    total_price     decimal(12,2) not null,
    status          enum ('CANCELLED','CONFIRMED','DELIVERED','IN_TRANSIT','OUT_FOR_DELIVERY','PLACED','PROCESSING','SHIPPED') not null,
    payment_type    varchar(30)   not null,
    ship_first_name varchar(100)  not null,
    ship_last_name  varchar(100),
    ship_email      varchar(150)  not null,
    ship_mobile     varchar(15)   not null,
    ship_address    varchar(255)  not null,
    ship_city       varchar(100)  not null,
    ship_state      varchar(100)  not null,
    ship_pincode    varchar(10)   not null,
    order_date      datetime(6)   not null,
    updated_at      datetime(6),
    primary key (id),
    constraint uk_orders_order_number unique (order_number),
    constraint fk_orders_customer foreign key (customer_id) references users (id),
    constraint fk_orders_product foreign key (product_id) references products (id)
) engine=InnoDB;

create index idx_orders_customer on orders (customer_id);
create index idx_orders_product on orders (product_id);
