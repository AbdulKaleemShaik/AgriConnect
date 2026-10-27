package com.agriconnect.order;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAddress {

    @Column(name = "ship_first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "ship_last_name", length = 100)
    private String lastName;

    @Column(name = "ship_email", nullable = false, length = 150)
    private String email;

    @Column(name = "ship_mobile", nullable = false, length = 15)
    private String mobileNo;

    @Column(name = "ship_address", nullable = false)
    private String address;

    @Column(name = "ship_city", nullable = false, length = 100)
    private String city;

    @Column(name = "ship_state", nullable = false, length = 100)
    private String state;

    @Column(name = "ship_pincode", nullable = false, length = 10)
    private String pincode;
}
