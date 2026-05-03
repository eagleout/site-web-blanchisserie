CREATE TABLE `addresses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`label` varchar(50) DEFAULT 'Domicile',
	`street` text NOT NULL,
	`complement` text,
	`postalCode` varchar(10) NOT NULL,
	`city` varchar(100) NOT NULL DEFAULT 'Paris',
	`instructions` text,
	`isDefault` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `addresses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `delivery_zones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`postalCode` varchar(10) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`deliveryFee` decimal(10,2) DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `delivery_zones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`serviceId` int NOT NULL,
	`serviceItemId` int,
	`serviceName` varchar(100) NOT NULL,
	`itemName` varchar(100),
	`quantity` int NOT NULL DEFAULT 1,
	`weight` decimal(5,1),
	`unitPrice` decimal(10,2) NOT NULL,
	`totalPrice` decimal(10,2) NOT NULL,
	`isPremium` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNumber` varchar(20) NOT NULL,
	`userId` int,
	`guestName` varchar(100),
	`guestEmail` varchar(320),
	`guestPhone` varchar(20),
	`addressStreet` text NOT NULL,
	`addressComplement` text,
	`addressPostalCode` varchar(10) NOT NULL,
	`addressCity` varchar(100) NOT NULL DEFAULT 'Paris',
	`addressInstructions` text,
	`pickupDate` timestamp NOT NULL,
	`pickupSlot` varchar(20) NOT NULL,
	`deliveryDate` timestamp NOT NULL,
	`deliverySlot` varchar(20) NOT NULL,
	`status` enum('pending','pickup_scheduled','picked_up','cleaning','delivery_scheduled','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
	`deliveryFee` decimal(10,2) NOT NULL DEFAULT '0.00',
	`serviceFee` decimal(10,2) NOT NULL DEFAULT '0.00',
	`total` decimal(10,2) NOT NULL DEFAULT '0.00',
	`isSorted` boolean DEFAULT false,
	`temperature` enum('cold','warm','hot') DEFAULT 'warm',
	`estimatedWeight` decimal(5,1),
	`notes` text,
	`paymentMethod` varchar(50),
	`paymentStatus` enum('pending','paid','refunded') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `service_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serviceId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `service_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`icon` varchar(50),
	`category` enum('washing','ironing','dry_cleaning','household') NOT NULL,
	`pricingType` enum('per_kg','per_item') NOT NULL DEFAULT 'per_kg',
	`basePrice` decimal(10,2) NOT NULL,
	`premiumPrice` decimal(10,2),
	`minWeight` decimal(5,1) DEFAULT '3.0',
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`),
	CONSTRAINT `services_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `time_slots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slotType` enum('pickup','delivery') NOT NULL,
	`dayOfWeek` int NOT NULL,
	`startTime` varchar(5) NOT NULL,
	`endTime` varchar(5) NOT NULL,
	`maxOrders` int NOT NULL DEFAULT 5,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `time_slots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);