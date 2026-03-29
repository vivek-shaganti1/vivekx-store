package com.example.demo.order;

import com.example.demo.Cart;
import com.example.demo.Product;
import com.example.demo.User;
import com.example.demo.CartRepository;
import com.example.demo.ProductRepository;
import com.example.demo.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private OrderItemRepository orderItemRepo;

    @Autowired
    private CartRepository cartRepo;

    @Autowired
    private UserRepository userRepo;
    
    @Autowired
    private ProductRepository productRepo;
    
    public Order placeOrder() {

        // 🔐 Get logged-in user from JWT
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Cart> cartItems = cartRepo.findByUser(user);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        Order order = new Order();
        order.setUser(user);

        List<OrderItem> orderItems = new ArrayList<>();
        double total = 0;

        for (Cart cart : cartItems) {
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(cart.getProduct());
            item.setQuantity(cart.getQuantity());
            item.setPrice(cart.getProduct().getPrice());

            total += item.getPrice() * item.getQuantity();
            orderItems.add(item);
        }

        order.setTotalAmount(total);
        order.setItems(orderItems);

        // 💾 Save order + items
        Order savedOrder = orderRepo.save(order);
        orderItemRepo.saveAll(orderItems);
        // 🧹 Clear cart
        cartRepo.deleteAll(cartItems);

        return savedOrder;
    }
    public Order cancelOrder(Long orderId) {

        User user = getCurrentUser();

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized");
        }

        if (!order.getStatus().equals("PLACED")) {
            throw new RuntimeException("Order cannot be cancelled");
        }

        order.setStatus("CANCELLED");
        return orderRepo.save(order);
    }
    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    public Order updateStatus(Long orderId, String status) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(status);
        return orderRepo.save(order);
    }
    public Order buyNow(Long productId, int quantity) {
        User user = getCurrentUser();
        Product product = productRepo.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));

        Order order = new Order();
        order.setUser(user);
       
       

        OrderItem item = new OrderItem();
        item.setOrder(order);
        item.setProduct(product);
        item.setQuantity(quantity);
        item.setPrice(product.getPrice());

        order.setItems(List.of(item));
        order.setTotalAmount(product.getPrice() * quantity);

        return orderRepo.save(order);
    }
    @Transactional
    public void markOrderPaid(Long orderId, String paymentId) {

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus("PAID");
        order.setPaymentId(paymentId);

        orderRepo.save(order);
    }
}