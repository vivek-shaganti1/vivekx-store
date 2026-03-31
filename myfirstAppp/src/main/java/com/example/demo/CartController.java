package com.example.demo;

import com.example.demo.dto.CartRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    /** Helper: get the currently authenticated user from JWT. */
    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    @Autowired
    private CartRepository cartRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ProductRepository productRepo;

    // 🔹 ADD TO CART (MERGE DUPLICATES)
    @PostMapping("/add")
    public ResponseEntity<String> addToCart(@RequestBody CartRequest request) {

        User user = getAuthenticatedUser();

        Product product = productRepo.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<Cart> existing =
                cartRepo.findByUserAndProduct(user, product);

        if (existing.isPresent()) {
            Cart cart = existing.get();
            cart.setQuantity(cart.getQuantity() + request.getQuantity());
            cartRepo.save(cart);
        } else {
            Cart cart = new Cart();
            cart.setUser(user);
            cart.setProduct(product);
            cart.setQuantity(request.getQuantity());
            cartRepo.save(cart);
        }

        return ResponseEntity.ok("Added to cart");
    }

    // 🔹 GET MY CART (JWT BASED)
    @GetMapping
    public List<Cart> getMyCart() {

        User user = getAuthenticatedUser();
        return cartRepo.findByUser(user);
    }

    // 🔹 UPDATE QUANTITY
    @PutMapping("/update/{cartId}")
    public ResponseEntity<String> updateQuantity(
            @PathVariable Long cartId,
            @RequestParam int quantity) {

        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        cart.setQuantity(quantity);
        cartRepo.save(cart);

        return ResponseEntity.ok("Quantity updated");
    }

    // 🔹 REMOVE ITEM
    @DeleteMapping("/remove/{cartId}")
    public ResponseEntity<String> removeItem(@PathVariable Long cartId) {

        cartRepo.deleteById(cartId);
        return ResponseEntity.ok("Item removed");
    }
}