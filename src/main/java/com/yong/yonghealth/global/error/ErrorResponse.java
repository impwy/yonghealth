package com.yong.yonghealth.global.error;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ErrorResponse {

    private final int status;
    private final String message;
    @Builder.Default
    private final LocalDateTime timestamp = LocalDateTime.now();
}
