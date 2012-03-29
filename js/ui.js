function init_ui() {
    var run_handler, run_button;

    document.f.code.value = BF_COMPILER_SOURCE;
    document.f.stdin.value = ",[,.]"; // 'cat' in brainfuck
    document.f.stdout.value = "";
    document.f.machine_status.value = "IDLE";

    run_handler = function() {
        var code, program, stdout;
        code = document.f.code.value;
        program = preprocess(code);
        bf_interp(
            document.f.stdin,
            document.f.stdout,
            document.f.machine_status,
            program
        );
    };

    run_button = document.getElementById("run_button");
    if (run_button.addEventListener) {
        run_button.addEventListener('click', run_handler, false);
    } else {
        run_button.attachEvent('onclick', run_handler);
    }
};
