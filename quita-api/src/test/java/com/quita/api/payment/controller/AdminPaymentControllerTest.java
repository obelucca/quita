package com.quita.api.payment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quita.api.payment.dto.AdminDashboardMetricsResponse;
import com.quita.api.payment.dto.AdminPaymentDetailResponse;
import com.quita.api.payment.model.PaymentStatus;
import com.quita.api.payment.service.AdminPaymentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AdminPaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AdminPaymentService adminPaymentService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void getMetrics_AsAdmin_ReturnsOk() throws Exception {
        AdminDashboardMetricsResponse metrics = AdminDashboardMetricsResponse.builder()
                .totalRevenue(new BigDecimal("150.00"))
                .approvedCount(5)
                .pendingCount(2)
                .failedCount(1)
                .build();

        when(adminPaymentService.getMetrics()).thenReturn(metrics);

        mockMvc.perform(get("/admin/payments/metrics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRevenue", is(150.00)))
                .andExpect(jsonPath("$.approvedCount", is(5)))
                .andExpect(jsonPath("$.pendingCount", is(2)))
                .andExpect(jsonPath("$.failedCount", is(1)));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getMetrics_AsUser_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/admin/payments/metrics"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllPayments_AsAdmin_ReturnsOk() throws Exception {
        UUID paymentId = UUID.randomUUID();
        AdminPaymentDetailResponse detail = AdminPaymentDetailResponse.builder()
                .id(paymentId)
                .userId(UUID.randomUUID())
                .userName("Cleber")
                .packageName("Starter")
                .creditsQuantity(3)
                .amount(new BigDecimal("19.90"))
                .status(PaymentStatus.APPROVED)
                .createdAt(LocalDateTime.now())
                .events(Collections.emptyList())
                .build();

        when(adminPaymentService.getAllPayments()).thenReturn(Collections.singletonList(detail));

        mockMvc.perform(get("/admin/payments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userName", is("Cleber")))
                .andExpect(jsonPath("$[0].packageName", is("Starter")));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getAllPayments_AsUser_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/admin/payments"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getPaymentDetail_AsAdmin_ReturnsOk() throws Exception {
        UUID paymentId = UUID.randomUUID();
        AdminPaymentDetailResponse detail = AdminPaymentDetailResponse.builder()
                .id(paymentId)
                .userId(UUID.randomUUID())
                .userName("Cleber")
                .packageName("Starter")
                .creditsQuantity(3)
                .amount(new BigDecimal("19.90"))
                .status(PaymentStatus.APPROVED)
                .createdAt(LocalDateTime.now())
                .events(Collections.emptyList())
                .build();

        when(adminPaymentService.getPaymentDetail(paymentId)).thenReturn(detail);

        mockMvc.perform(get("/admin/payments/" + paymentId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userName", is("Cleber")));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void forceReconciliation_AsAdmin_ReturnsOk() throws Exception {
        UUID paymentId = UUID.randomUUID();
        AdminPaymentDetailResponse detail = AdminPaymentDetailResponse.builder()
                .id(paymentId)
                .userId(UUID.randomUUID())
                .userName("Cleber")
                .packageName("Starter")
                .creditsQuantity(3)
                .amount(new BigDecimal("19.90"))
                .status(PaymentStatus.APPROVED)
                .createdAt(LocalDateTime.now())
                .events(Collections.emptyList())
                .build();

        when(adminPaymentService.forceReconciliation(paymentId)).thenReturn(detail);

        mockMvc.perform(post("/admin/payments/" + paymentId + "/reconcile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("APPROVED")));
    }
}
