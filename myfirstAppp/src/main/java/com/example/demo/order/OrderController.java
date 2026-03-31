package com.example.demo.order;
import java.util.Map;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;
import com.example.demo.UserRepository;
import com.example.demo.User;
import org.springframework.security.core.context.SecurityContextHolder;
@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepo;
    @Autowired
    private UserRepository userRepo;
    // 🔥 PLACE ORDER (CHECKOUT)
    @PostMapping("/place")
    public ResponseEntity<?> placeOrder() {
        return ResponseEntity.ok(orderService.placeOrder());
    }

    // 📦 GET MY ORDERS
//    @GetMapping("/my")
//    public List<Order> getMyOrders() {
//        return orderRepo.findByUser(
//            orderService.getCurrentUser()
//        );
//    }
    @GetMapping("/my")
    public List<Order> getMyOrders() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepo.findByUser(user);
    }
    @PutMapping("/cancel/{orderId}")
    public ResponseEntity<?> cancelOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId));
    }
    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }
    @PostMapping("/buy-now")
    public Order buyNow(
            @RequestParam Long productId,
            @RequestParam int quantity
    ) {
        return orderService.buyNow(productId, quantity);
    }
    @PutMapping("/status/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public Order updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        Order order = orderRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(status);
        return orderRepo.save(order);
    }
    @PutMapping("/test")
    public String testOrders() {
        return "Orders controller working";
    }
    @GetMapping("/ping")
    public String ping() {
        return "ORDERS CONTROLLER OK";
    }
    @GetMapping("/admin/summary")
   
    public Map<String, Object> adminSummary() {
        List<Order> orders = orderRepo.findAll();

        long placed = orders.stream().filter(o -> o.getStatus().equals("PLACED")).count();
        long shipped = orders.stream().filter(o -> o.getStatus().equals("SHIPPED")).count();
        long delivered = orders.stream().filter(o -> o.getStatus().equals("DELIVERED")).count();
        long cancelled = orders.stream().filter(o -> o.getStatus().equals("CANCELLED")).count();

        double revenue = orders.stream()
            .filter(o -> o.getStatus().equals("DELIVERED"))
            .mapToDouble(Order::getTotalAmount)
            .sum();

        Map<String, Object> res = new HashMap<>();
        res.put("totalOrders", orders.size());
        res.put("placed", placed);
        res.put("shipped", shipped);
        res.put("delivered", delivered);
        res.put("cancelled", cancelled);
        res.put("revenue", revenue);

        return res;
    }
    
}