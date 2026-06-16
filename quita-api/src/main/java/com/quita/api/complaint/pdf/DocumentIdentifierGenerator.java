package com.quita.api.complaint.pdf;

import com.quita.api.complaint.model.Complaint;
import java.time.format.DateTimeFormatter;

public class DocumentIdentifierGenerator {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    public static String generate(Complaint complaint) {
        if (complaint == null || complaint.getId() == null) {
            return "QT-00000000-000000";
        }
        String dateStr = (complaint.getCreatedAt() != null) 
            ? complaint.getCreatedAt().format(DATE_FORMATTER) 
            : java.time.LocalDateTime.now().format(DATE_FORMATTER);
        String uuidStr = complaint.getId().toString().replace("-", "");
        String suffix = uuidStr.substring(Math.max(0, uuidStr.length() - 6)).toUpperCase();
        return "QT-" + dateStr + "-" + suffix;
    }
}
