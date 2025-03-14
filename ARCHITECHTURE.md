# Kiến trúc mỗi module

## 1. Services
- Chức năng: Là các singleton quản lí logic nghiệp vụ
- Đặc điểm:
    - Lưu trữ và quản lí data dưới dạng các models
    - Cung cấp các interface để các Scene/View/GameObject truy cập data

## 2. Models
- Chức năng: Đại diện cho các đối tượng dữ liệu trong game
- Đặc điểm:
    - Class hướng đối tượng với các  thuộc tính và phương thức
    - Thường là POJO
    - Có thể bao gồm validation logic và helpers

## 3. Scene/View/Game Objects
- Chức năng: Hiển thị dữ liệu và xử lí tương tác người dùng
- Đặc điểm:
    - Scene: các màn hình chính của game
    - View: các component UI nhỏ hơn
    - Game Objects: các entity trong game (player, enemies, items, etc.)
    - Lấy data từ service và hiển thị
    - Không trực tiếp thay đổi model, mà thông qua services