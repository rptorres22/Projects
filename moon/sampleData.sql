CREATE DATABASE  IF NOT EXISTS `moonrise_crystals_sample` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `moonrise_crystals_sample`;
-- MySQL dump 10.13  Distrib 5.6.23, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: moonrise_crystals_sample
-- ------------------------------------------------------
-- Server version	5.7.6-m16-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customers` (
  `customer_id` smallint(6) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(45) DEFAULT NULL,
  `last_name` varchar(45) DEFAULT NULL,
  `username` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `state` varchar(45) DEFAULT NULL,
  `zip` varchar(20) DEFAULT NULL,
  `country` varchar(45) DEFAULT 'USA',
  `notes` text,
  `deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `Username_UNIQUE` (`username`),
  UNIQUE KEY `Email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'First','Customer','firstcustomer','firstcustomer@moonrisecrystals.com','855-855-8855','Moonrise Crystals Road 23','Port Townsend','WA','98368','USA','Customer related note, message or something like that.',0),(2,'Second','Customer','secondcustomer','secondcustomer@moonrisecrystals.com','855-855-8855','Moonrise Crystals Road 75','Port Townsend','WA','98368','USA',NULL,0);
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_details`
--

DROP TABLE IF EXISTS `order_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_details` (
  `order_id` smallint(6) NOT NULL,
  `product_id` smallint(6) NOT NULL,
  `quantity` smallint(6) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `order_details_id` smallint(6) NOT NULL AUTO_INCREMENT,
  `feedback_message` text,
  PRIMARY KEY (`order_details_id`),
  KEY `idx FK Product_ID` (`product_id`),
  KEY `idx FK Order_ID` (`order_id`),
  CONSTRAINT `fk_Orders_has_Products_Orders1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Orders_has_Products_Products1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_details`
--

LOCK TABLES `order_details` WRITE;
/*!40000 ALTER TABLE `order_details` DISABLE KEYS */;
INSERT INTO `order_details` VALUES (1,2,1,7.25,1,'0'),(1,10,1,7.25,2,'Julie, thank you! I love the item.'),(2,12,2,8.25,3,'0'),(2,5,1,12.25,4,'0'),(3,7,3,7.25,5,'0');
/*!40000 ALTER TABLE `order_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `order_id` smallint(6) NOT NULL AUTO_INCREMENT,
  `customer_id` smallint(6) NOT NULL,
  `platform_id` varchar(10) NOT NULL,
  `promotion_code` varchar(20) NOT NULL,
  `date` date DEFAULT NULL,
  `additional_cost` decimal(10,2) DEFAULT '0.00',
  `notes` text,
  `repeat_customer` varchar(10) DEFAULT NULL,
  `status` smallint(6) DEFAULT '0',
  PRIMARY KEY (`order_id`),
  KEY `idx Customer_ID` (`customer_id`),
  KEY `idx Platform_ID` (`platform_id`),
  KEY `fk_orders_promotions1_idx` (`promotion_code`),
  CONSTRAINT `fk_Orders_Customers1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Orders_Platforms1` FOREIGN KEY (`platform_id`) REFERENCES `platforms` (`platform_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_orders_promotions1` FOREIGN KEY (`promotion_code`) REFERENCES `promotions` (`promotion_code`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,1,'1','0','2015-05-10',0.00,'',NULL,0),(2,2,'3','0','2015-05-12',0.00,'',NULL,0),(3,2,'2','0','2015-05-07',5.00,'Some weird reason.',NULL,0);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `platforms`
--

DROP TABLE IF EXISTS `platforms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `platforms` (
  `platform_id` varchar(10) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`platform_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `platforms`
--

LOCK TABLES `platforms` WRITE;
/*!40000 ALTER TABLE `platforms` DISABLE KEYS */;
INSERT INTO `platforms` VALUES ('1','Website'),('2','Ebay'),('3','Etsy');
/*!40000 ALTER TABLE `platforms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `product_id` smallint(6) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `default_price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` smallint(6) DEFAULT '0',
  PRIMARY KEY (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'- Not an Item',0.00,0),(2,'Agate, Blue Lace',7.25,0),(3,'Agate, Botswana',5.75,0),(4,'Agate, Dendritic',6.50,0),(5,'Agate, Fire',12.25,0),(6,'Agate, Moss',6.75,0),(7,'Agatized Coral',7.25,0),(8,'Amazonite',8.50,0),(9,'Amethyst',10.50,0),(10,'Amethyst, Chevron',7.25,0),(11,'Ametrine',10.75,0),(12,'Angelite',8.25,0);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `promotions` (
  `promotion_code` varchar(20) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `description` varchar(45) DEFAULT NULL,
  `value` varchar(45) DEFAULT NULL,
  `percent` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`promotion_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES ('0','Nothing','Nothing','0',0);
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouse_details`
--

DROP TABLE IF EXISTS `warehouse_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `warehouse_details` (
  `product_id` smallint(6) NOT NULL,
  `warehouse_id` tinyint(4) NOT NULL DEFAULT '0',
  `quantity` smallint(6) DEFAULT NULL,
  KEY `idx FK Warehouse_ID` (`warehouse_id`),
  KEY `idx FK Product_ID` (`product_id`),
  CONSTRAINT `fk_Products_has_Warehouses_Products1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_Products_has_Warehouses_Warehouses1` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`warehouse_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse_details`
--

LOCK TABLES `warehouse_details` WRITE;
/*!40000 ALTER TABLE `warehouse_details` DISABLE KEYS */;
/*!40000 ALTER TABLE `warehouse_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouses`
--

DROP TABLE IF EXISTS `warehouses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `warehouses` (
  `warehouse_id` tinyint(4) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `notes` text,
  `deleted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`warehouse_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouses`
--

LOCK TABLES `warehouses` WRITE;
/*!40000 ALTER TABLE `warehouses` DISABLE KEYS */;
INSERT INTO `warehouses` VALUES (1,'Main Storage',NULL,0);
/*!40000 ALTER TABLE `warehouses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'moonrise_crystals_sample'
--

--
-- Dumping routines for database 'moonrise_crystals_sample'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-05-12 15:54:01
