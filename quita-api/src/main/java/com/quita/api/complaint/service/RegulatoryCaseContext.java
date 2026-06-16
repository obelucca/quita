package com.quita.api.complaint.service;

import lombok.Builder;
import lombok.Getter;
import lombok.ToString;

import java.math.BigDecimal;

@Getter
@Builder
@ToString
public class RegulatoryCaseContext {
    private final String profile;
    private final boolean hasCedida;
    private final boolean hasMultipleCreditors;
    private final boolean hasNoActiveOperation;
    private final boolean hasBalanceDivergence;
    private final int debtCount;
    private final BigDecimal totalAmount;
}
