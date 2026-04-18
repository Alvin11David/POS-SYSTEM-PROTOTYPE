# Jambo POS Prototype

## Overview

This project is a simple Point of Sale (POS) system prototype developed as part of the Phase 3 technical assessment.

The goal of the system is to demonstrate the ability to design and implement a clean, functional, and user-friendly POS workflow with minimal guidance. The application focuses on core retail operations including product management, sales processing, and daily sales tracking.

## Objectives

The system is designed to meet the following requirements:

* Add products with a name and price
* Record sales transactions
* Display total sales for the day

In addition to meeting these functional requirements, emphasis was placed on usability, simplicity, and logical flow.

## Technology Stack

Frontend:

* React with TypeScript

Backend:

* Django
* Django REST Framework

The separation of frontend and backend ensures scalability, maintainability, and a clear structure for handling business logic and presentation.

## System Features

### Product Management

Users can add new products by providing a product name and price. Products are stored and displayed in a structured format for easy selection during sales.

### Sales Processing

The system allows users to select products and record a sale. The process is designed to be simple and efficient, reflecting real-world POS usage where speed is critical.

### Daily Sales Tracking

The application calculates and displays the total sales made within the current day, providing a quick overview of business performance.

## System Workflow

1. The user adds products to the system.
2. Products are displayed in a list for selection.
3. The user selects one or more products to create a sale.
4. The system calculates the total for the transaction.
5. The sale is recorded.
6. The daily total sales value is updated and displayed.

## Approach

The development approach focused on clarity and simplicity. The system was broken down into core components:

* Product management
* Sales handling
* Reporting logic

Each component was implemented independently and then integrated to ensure a smooth end-to-end flow.

The backend handles data storage, validation, and business logic, while the frontend is responsible for user interaction and presentation.

## Key Design Decisions

* A minimal feature set was intentionally chosen to ensure stability and clarity of implementation.
* A RESTful API structure was used to separate concerns between frontend and backend.
* The user interface prioritizes ease of use, with a straightforward flow requiring minimal steps to complete a sale.
* Data is structured in a way that allows future extension, such as adding users, inventory tracking, or multi-day reports.

## Challenges Encountered

One of the main challenges was designing a workflow that is both simple and realistic. In real-world POS systems, efficiency is critical, so care was taken to minimize unnecessary steps.

Another challenge was ensuring proper state management between product selection and sales recording, particularly in keeping totals accurate and synchronized with backend data.

## Future Improvements

Given more time, the following enhancements could be implemented:

* User authentication and role-based access control
* Persistent database optimization and reporting across multiple days
* Inventory tracking and stock management
* Receipt generation and printing
* Improved analytics and visual reporting

## Installation and Setup

### Backend

1. Navigate to the backend directory

2. Create a virtual environment

3. Install dependencies

   pip install -r requirements.txt

4. Run migrations

   python manage.py migrate

5. Start the server

   python manage.py runserver

### Frontend

1. Navigate to the frontend directory

2. Install dependencies

   npm install

3. Start the development server

   npm run dev

## Usage

* Add products using the product form
* Select products to record a sale
* View total sales for the day on the dashboard or reports section

## Submission Details

This project was developed as part of the Phase 3 assignment. It demonstrates the ability to translate system understanding into a working prototype with a clear structure and usable interface.

## Author

Waluube Alvin David
